# Multi-Cancer Detection System

This project is a deep learning-based system for detecting **brain**, **lung**, and **breast** cancers from medical images. It uses a ResNet-50 CNN model with custom preprocessing and Focal Loss to improve classification performance.

## Project Overview

- Multi-class cancer detection (Brain, Lung, Breast)
- Binary classification for each: Cancerous / Non-Cancerous
- Custom image preprocessing and enhancement
- Model built on ResNet-50 architecture
- Flask-based frontend for predictions

---

## 📥 Downloads

Due to GitHub file size limits, the model and dataset are available via Google Drive:

- 🔗 [Download Model File (`trailbest_cancer_model.pth`)](https://drive.google.com/file/d/1plc3rtYftRDt3dgYlR47ZpBjuVwBfsbD/view?usp=sharing)
- 🔗 [Download Dataset](https://drive.google.com/drive/folders/179Zl0DUJ-ewFtqnp0DCulIvNHD-klUDb?usp=sharing)

After downloading:
- Place the model file and do the necessary path settings
- Place the dataset and do the necessary path changings in your local system

---

## 🚀 Getting Started

1. Clone this repository:
   ```bash
   git clone https://github.com/PranathiKundrapu/MultiCancerDetectionSystem.git
   cd MultiCancerDetectionSystem
2.Install dependencies:
pip install -r requirements.txt

3. Run flask app:
   python app/app.py

Model Info
Backbone: ResNet-50

Loss Function: Focal Loss

Framework: PyTorch

Training script: train.py

Prediction module: cancer_predictor.py

📌 Note
Make sure you have downloaded the model and dataset from the links above and placed them in the correct directories before running the app.

📬 Contact
For any issues or questions, feel free to open an issue or reach out via GitHub.

