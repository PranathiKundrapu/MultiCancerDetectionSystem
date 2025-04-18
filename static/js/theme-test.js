// Theme test script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Theme test script loaded');
    
    // Check if theme toggle button exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        console.log('Theme toggle button found');
        
        // Check current theme
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        console.log('Current theme:', currentTheme);
        
        // Check if theme is applied to body
        const body = document.body;
        const bodyTheme = body.getAttribute('data-theme');
        console.log('Body theme:', bodyTheme);
        
        // Check if theme variables are applied
        const computedStyle = getComputedStyle(document.body);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        console.log('Background color:', bgColor);
        console.log('Text color:', textColor);
        
        // Diagnostic information only - no test button
    } else {
        console.error('Theme toggle button not found');
    }
}); 