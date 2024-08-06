// 변경된 웹앱 URL
const scriptUrl = 'https://script.google.com/macros/s/AKfycbxriZtrysnwgb-VyNsbMHCYd84Ft5835UKFAX7Z8ZelFUyAvis_zd1uPKfKsUJXuIdTgg/exec';

const CACHE_EXPIRATION_TIME = 3600000; // 1시간 (밀리초 단위)

function loadVideos() {
    const cachedData = localStorage.getItem('videoData');
    const cacheTimestamp = localStorage.getItem('cacheTimestamp');

    const now = new Date().getTime();

    if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_EXPIRATION_TIME)) {
        renderThumbnails(JSON.parse(cachedData));
        lazyLoadImages();
    } else {
        fetch(scriptUrl)
            .then(response => response.json())
            .then(data => {
                // 데이터 정렬: 최근 항목이 앞에 오도록 역순으로 정렬
                const sortedData = data.reverse(); 
                localStorage.setItem('videoData', JSON.stringify(sortedData));
                localStorage.setItem('cacheTimestamp', now); // 타임스탬프 저장
                renderThumbnails(sortedData);
                lazyLoadImages();
            })
            .catch(error => {
                console.error('Error loading data:', error);
                document.getElementById('videoList').innerHTML = 'Failed to load videos.';
            });
    }
}

function renderThumbnails(data) {
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = ''; // 이전 콘텐츠 지우기
    data.forEach(entry => {
        const videoItem = document.createElement('div');
        videoItem.className = 'videoItem';
        videoItem.onclick = () => showPopup(entry.videoId);

        const img = document.createElement('img');
        img.dataset.src = entry.thumbnail; // 레이지 로딩을 위한 데이터 속성
        img.alt = "Thumbnail";
        img.className = 'thumbnail lazy';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = entry.title;

        const viewCount = document.createElement('div');
        viewCount.className = 'viewCount';
        viewCount.textContent = `조회수: ${entry.viewCount ? Number(entry.viewCount).toLocaleString('ko-KR') : '0'}`; // 조회수를 천 단위 구분자와 함께 표시

        videoItem.appendChild(img);
        videoItem.appendChild(title);
        videoItem.appendChild(viewCount);
        videoList.appendChild(videoItem);
    });
}

function lazyLoadImages() {
    const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // 구형 브라우저에 대한 대체
        lazyImages.forEach(function(lazyImage) {
            lazyImage.src = lazyImage.dataset.src;
        });
    }
}

function showPopup(videoId) {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const videoPlayer = document.getElementById('videoPlayer');

    // 자동 재생을 위해 autoplay 파라미터 추가
    videoPlayer.innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" frameborder="0" allowfullscreen></iframe>`;
    
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

function closePopup() {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const videoPlayer = document.getElementById('videoPlayer');

    popup.style.display = 'none';
    overlay.style.display = 'none';
    videoPlayer.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', loadVideos);
