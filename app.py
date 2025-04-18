from flask import Flask, render_template, request, jsonify
import torch  # Changed from TensorFlow to PyTorch
import numpy as np
from PIL import Image
import io
import os
from torchvision import transforms
import torch.nn.functional as F
import cv2

app = Flask(__name__)

# Define your model class (MUST match your training code)
class ResNet50Model(torch.nn.Module):
    def __init__(self, num_classes=6):
        super().__init__()
        self.resnet = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', weights=None)
        num_features = self.resnet.fc.in_features
        self.resnet.fc = torch.nn.Sequential(
            torch.nn.Linear(num_features, 512),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.5),
            torch.nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        return self.resnet(x)

# Load the PyTorch model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ResNet50Model().to(device)
model.load_state_dict(torch.load('trailbest_cancer_model.pth', map_location=device)["model_state_dict"])
model.eval()
print("PyTorch model loaded successfully!")

# Define cancer types (6 classes as per your dataset)
CANCER_TYPES = [
    'Brain Cancerous', 'Brain Non-Cancerous',
    'Lung Cancerous', 'Lung Non-Cancerous',
    'Breast Cancerous', 'Breast Non-Cancerous'
]

# Preprocessing transform (matches your training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def is_medical_scan(image):
    """
    Validates if an image is a medical scan (CT/MRI) or histopathological image.
    Allows both grayscale images and images with specific color patterns found in histopathology.
    """
    # Convert PIL Image to numpy array
    img_array = np.array(image)
    
    # For RGB images
    if len(img_array.shape) == 3:
        # Calculate histogram features for more robust detection
        # Convert to HSV color space which better separates color information
        if img_array.shape[2] == 3:  # Ensure it's an RGB image
            img_hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
            
            # Get histograms for each channel
            h_hist = cv2.calcHist([img_hsv], [0], None, [30], [0, 180])
            s_hist = cv2.calcHist([img_hsv], [1], None, [32], [0, 256])
            
            # Check for typical H&E staining patterns in histopathology
            # Histopathology images often have peaks in specific hue ranges (purples/pinks)
            # and have medium to high saturation
            h_hist_normalized = h_hist / np.sum(h_hist)
            s_hist_normalized = s_hist / np.sum(s_hist)
            
            # Calculate the average saturation
            avg_saturation = np.mean(img_hsv[:,:,1])
            
            # Check for H&E staining patterns (purple/pink hues)
            purple_pink_range = np.sum(h_hist_normalized[20:30])  # Hues in purple/pink range
            if purple_pink_range > 0.3:  # If significant purple/pink colors present
                return True
                
            # Histopathology images typically have medium to high saturation
            if avg_saturation > 40:  # Lowered threshold from 50 to 40
                return True
                
            # Check for grayscale characteristics (for CT/MRI)
            r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
            rg_diff = np.mean(np.abs(r - g))
            rb_diff = np.mean(np.abs(r - b))
            gb_diff = np.mean(np.abs(g - b))
            
            avg_diff = (rg_diff + rb_diff + gb_diff) / 3
            if avg_diff < 35:  # Increased threshold from 30 to 35
                return True
                
            # Additional check for uniform background with distinct foreground (common in medical images)
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
            white_percentage = np.sum(binary == 255) / binary.size
            
            # Many medical images have significant white/black background
            if white_percentage > 0.65 or white_percentage < 0.35:  # Adjusted thresholds
                return True
                
            return False
    
    return True  # Already grayscale

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/detection')
def detection():
    return render_template('detection.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/cancer-types')
def cancer_types():
    return render_template('cancer_types.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the image from POST request
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No selected file'}), 400
        # Open and validate image
        image = Image.open(io.BytesIO(file.read()))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        # Check if the image appears to be a medical scan
        if not is_medical_scan(image):
            return jsonify({
                'status': 'error',
                'message': 'Please upload a medical scan image. The image appears to be a regular photo or artwork.'
            }), 400
        # Preprocess the image
        image_tensor = transform(image).unsqueeze(0).to(device)
        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = F.softmax(outputs, dim=1)
            confidence, predicted_class = torch.max(probabilities, 1)
            confidence = confidence.item()
            predicted_class = predicted_class.item()
            
        # Add confidence threshold check
        if confidence < 0.80:  # You can adjust this threshold as needed
            return jsonify({
                'status': 'error',
                'message': 'Unable to confidently classify this image. Please ensure you are uploading a clear medical scan.'
            }), 400
            
        # Prepare response
        response = {
            'cancer_type': CANCER_TYPES[predicted_class],
            'confidence': f"{confidence:.2%}",
            'status': 'success'
        }
        
    except Exception as e:
        print("Error during prediction:", str(e))
        response = {
            'status': 'error',
            'message': 'Error processing image. Please upload a valid brain, breast, or lung scan.'
        }
        return jsonify(response), 500
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)