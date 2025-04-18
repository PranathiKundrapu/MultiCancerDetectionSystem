document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality (inherited from main.js)
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Update charts with new theme
        updateChartsTheme(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Initialize charts
    initializeCharts();
});

function initializeCharts() {
    // Set chart colors based on theme
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDarkTheme ? '#e0e0e0' : '#333333';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Accuracy Chart
    const accuracyCtx = document.getElementById('accuracyChart').getContext('2d');
    const accuracyChart = new Chart(accuracyCtx, {
        type: 'bar',
        data: {
            labels: ['Brain Cancerous', 'Brain Non-Cancerous', 'Lung Cancerous', 'Lung Non-Cancerous', 'Breast Cancerous', 'Breast Non-Cancerous'],
            datasets: [{
                label: 'Accuracy by Cancer Type',
                data: [95, 94, 96, 95, 95, 95],
                backgroundColor: [
                    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949'
                ],
                borderColor: [
                    '#3d5f7c', '#c17023', '#b04547', '#5d928e', '#47803c', '#bea13a'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '% accuracy';
                        }
                    }
                }
            }
        }
    });

    // Distribution Chart
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    const distributionChart = new Chart(distributionCtx, {
        type: 'pie',
        data: {
            labels: ['Brain Cancerous', 'Brain Non-Cancerous', 'Lung Cancerous', 'Lung Non-Cancerous', 'Breast Cancerous', 'Breast Non-Cancerous'],
            datasets: [{
                data: [18, 17, 22, 15, 16, 12],
                backgroundColor: [
                    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949'
                ],
                borderColor: [
                    '#3d5f7c', '#c17023', '#b04547', '#5d928e', '#47803c', '#bea13a'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Store chart references for theme updates
    window.accuracyChart = accuracyChart;
    window.distributionChart = distributionChart;
}

function updateChartsTheme(theme) {
    const isDarkTheme = theme === 'dark';
    const textColor = isDarkTheme ? '#e0e0e0' : '#333333';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update accuracy chart
    if (window.accuracyChart) {
        window.accuracyChart.options.scales.y.ticks.color = textColor;
        window.accuracyChart.options.scales.x.ticks.color = textColor;
        window.accuracyChart.options.scales.y.grid.color = gridColor;
        window.accuracyChart.options.scales.x.grid.color = gridColor;
        window.accuracyChart.update();
    }
    
    // Distribution chart doesn't need theme updates as it uses fixed colors
} 