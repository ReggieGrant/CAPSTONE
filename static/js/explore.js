/**
 * Clearview Explore Page - Interactive Filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Get all filter elements
    const filterTabs = document.querySelectorAll('.filter-tab');
    const weatherChips = document.querySelectorAll('.weather-chip');
    const momentItems = document.querySelectorAll('.moment-item');
    const loadMoreBtn = document.querySelector('.btn-load-more');
    
    let currentFilter = 'all';
    let currentWeather = 'all';
    
    // ==================== FILTER TAB FUNCTIONALITY ====================
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get filter type
            currentFilter = this.dataset.filter;
            
            // Apply filters
            applyFilters();
        });
    });
    
    // ==================== WEATHER CHIP FUNCTIONALITY ====================
    weatherChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Remove active class from all chips
            weatherChips.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked chip
            this.classList.add('active');
            
            // Get weather type
            currentWeather = this.dataset.weather;
            
            // Apply filters
            applyFilters();
        });
    });
    
    // ==================== APPLY FILTERS ====================
    function applyFilters() {
        let visibleCount = 0;
        
        momentItems.forEach((item, index) => {
            const itemWeather = item.dataset.weather;
            const itemType = item.dataset.type;
            
            let showItem = true;
            
            // Check weather filter
            if (currentWeather !== 'all' && itemWeather !== currentWeather) {
                showItem = false;
            }
            
            // Check type filter
            if (currentFilter !== 'all' && itemType !== currentFilter) {
                showItem = false;
            }
            
            // Show or hide item with animation
            if (showItem) {
                item.style.display = 'block';
                item.style.animationDelay = `${visibleCount * 0.1}s`;
                visibleCount++;
                
                // Reset animation
                item.style.animation = 'none';
                setTimeout(() => {
                    item.style.animation = '';
                }, 10);
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update results count
        updateResultsCount(visibleCount);
    }
    
    // ==================== UPDATE RESULTS COUNT ====================
    function updateResultsCount(count) {
        const resultsText = document.createElement('div');
        resultsText.className = 'results-count';
        resultsText.style.cssText = `
            text-align: center;
            margin: 2rem 0;
            font-size: 1.1rem;
            color: #7f8c8d;
        `;
        
        if (count === 0) {
            resultsText.innerHTML = `
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; display: block; color: #bdc3c7;"></i>
                <strong>No moments found</strong><br>
                <small>Try adjusting your filters</small>
            `;
        } else {
            resultsText.innerHTML = `Showing <strong>${count}</strong> moment${count !== 1 ? 's' : ''}`;
        }
        
        // Remove old results count if exists
        const oldResults = document.querySelector('.results-count');
        if (oldResults) {
            oldResults.remove();
        }
        
        // Insert after moments grid
        const momentsGrid = document.getElementById('momentsGrid');
        momentsGrid.parentNode.insertBefore(resultsText, momentsGrid.nextSibling);
    }
    
    // ==================== MOMENT CARD INTERACTIONS ====================
    momentItems.forEach(item => {
        const card = item.querySelector('.moment-card-explore');
        
        // Click to view details
        card.addEventListener('click', function() {
            // In production, this would navigate to detail page
            console.log('View moment details');
            // window.location.href = `/moment/${momentId}`;
        });
        
        // Heart button interaction
        const heartBtn = card.querySelector('.moment-stats span:first-child');
        if (heartBtn) {
            heartBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent card click
                toggleLike(this);
            });
        }
        
        // Comment button interaction
        const commentBtn = card.querySelector('.moment-stats span:nth-child(2)');
        if (commentBtn) {
            commentBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Open comments');
            });
        }
        
        // Share button interaction
        const shareBtn = card.querySelector('.moment-stats span:nth-child(3)');
        if (shareBtn) {
            shareBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                sharePost(card);
            });
        }
    });
    
    // ==================== LIKE FUNCTIONALITY ====================
    function toggleLike(element) {
        const icon = element.querySelector('i');
        const countText = element.childNodes[1];
        let count = parseInt(countText.textContent.replace('k', '00').replace('.', ''));
        
        if (icon.classList.contains('fas')) {
            // Unlike
            icon.classList.remove('fas');
            icon.classList.add('far');
            count--;
            element.style.color = 'white';
        } else {
            // Like
            icon.classList.remove('far');
            icon.classList.add('fas');
            count++;
            element.style.color = '#e74c3c';
            
            // Animate heart
            icon.style.animation = 'heartBeat 0.5s ease';
            setTimeout(() => {
                icon.style.animation = '';
            }, 500);
        }
        
        // Update count display
        if (count >= 1000) {
            countText.textContent = ` ${(count / 1000).toFixed(1)}k`;
        } else {
            countText.textContent = ` ${count}`;
        }
    }
    
    // ==================== SHARE FUNCTIONALITY ====================
    function sharePost(card) {
        const username = card.querySelector('.username').textContent;
        const location = card.querySelector('.location-badge').textContent.trim();
        
        if (navigator.share) {
            navigator.share({
                title: 'Clearview Weather Moment',
                text: `Check out this weather moment from ${username} in ${location}!`,
                url: window.location.href
            }).catch(err => console.log('Share cancelled'));
        } else {
            // Fallback: Copy link to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                showNotification('Link copied to clipboard!');
            });
        }
    }
    
    // ==================== NOTIFICATION ====================
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    // ==================== LOAD MORE FUNCTIONALITY ====================
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Show loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;
            
            // Simulate loading more moments
            setTimeout(() => {
                loadMoreMoments();
                this.innerHTML = '<i class="fas fa-arrow-down"></i> Load More Moments';
                this.disabled = false;
            }, 1500);
        });
    }
    
    function loadMoreMoments() {
        // In production, this would fetch from API
        const grid = document.getElementById('momentsGrid');
        
        // Example: Add 3 more moments
        const newMoments = [
            createMomentCard('sunny', 'trending', '@beach_life', 'Santa Monica, CA', '80°F', 'Beautiful sunset! 🌅', '892', '56'),
            createMomentCard('rainy', 'recent', '@cozy_days', 'Boston, MA', '52°F', 'Rainy afternoon vibes ☔', '634', '42'),
            createMomentCard('snowy', 'featured', '@winter_lover', 'Lake Tahoe, CA', '28°F', 'Perfect snow day! ⛷️', '1.8k', '124')
        ];
        
        newMoments.forEach((html, index) => {
            const div = document.createElement('div');
            div.className = 'moment-item';
            div.innerHTML = html;
            div.style.animationDelay = `${index * 0.1}s`;
            grid.appendChild(div);
        });
        
        showNotification('3 new moments loaded!');
    }
    
    function createMomentCard(weather, type, username, location, temp, caption, likes, comments) {
        const weatherClass = weather + '-gradient';
        const weatherIcon = getWeatherIcon(weather);
        
        return `
            <div class="moment-card-explore ${weatherClass}" data-weather="${weather}" data-type="${type}">
                <div class="gradient-overlay"></div>
                <div class="weather-icon-bg">
                    <i class="${weatherIcon}"></i>
                </div>
                <div class="moment-content">
                    <div class="moment-header">
                        <img src="https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}" alt="User" class="user-avatar-small">
                        <div class="user-info">
                            <div class="username">${username}</div>
                            <div class="post-time">Just now</div>
                        </div>
                    </div>
                    <div class="moment-details">
                        <div class="weather-badge ${weather}">
                            <i class="${weatherIcon}"></i> ${temp}
                        </div>
                        <div class="location-badge">
                            <i class="fas fa-map-marker-alt"></i> ${location}
                        </div>
                    </div>
                    <p class="moment-caption">${caption}</p>
                    <div class="moment-stats">
                        <span><i class="far fa-heart"></i> ${likes}</span>
                        <span><i class="fas fa-comment"></i> ${comments}</span>
                        <span><i class="fas fa-share"></i> ${Math.floor(Math.random() * 50)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getWeatherIcon(weather) {
        const icons = {
            sunny: 'fas fa-sun',
            rainy: 'fas fa-cloud-rain',
            cloudy: 'fas fa-cloud',
            snowy: 'fas fa-snowflake',
            stormy: 'fas fa-bolt',
            foggy: 'fas fa-smog',
            windy: 'fas fa-wind'
        };
        return icons[weather] || 'fas fa-cloud';
    }
    
    // ==================== KEYBOARD SHORTCUTS ====================
    document.addEventListener('keydown', function(e) {
        // Press 'A' for All
        if (e.key === 'a' && !e.target.matches('input, textarea')) {
            weatherChips[0].click();
        }
        // Press '1-7' for weather types
        if (e.key >= '1' && e.key <= '7' && !e.target.matches('input, textarea')) {
            const index = parseInt(e.key);
            if (weatherChips[index]) {
                weatherChips[index].click();
            }
        }
    });
    
    // Initialize results count
    updateResultsCount(momentItems.length);
});

// ==================== CSS ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.3); }
        50% { transform: scale(1.1); }
        75% { transform: scale(1.2); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);