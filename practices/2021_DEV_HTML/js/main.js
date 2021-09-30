const backToTop = document.getElementById('backtotop');

const checkScroll = () => {
    /*
      웹페이지가 수직으로 얼마나 스크롤되었는지를 확인하는 값(픽셀 단위로 반환)
      https://developer.mozilla.org/ko/docs/Web/API/Window/pageYOffset
    */
    let pageYOffset = window.pageYOffset;

    if (pageYOffset !== 0) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }

}

const moveBackToTop = () => {
    if (window.pageYOffset > 0) {
        /*
        smooth 하게 스크롤하기
        https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
        */
       window.scrollTo({top: 0, behavior: "smooth"})
    }
}

window.addEventListener('scroll', checkScroll);
backToTop.addEventListener('click', moveBackToTop);

/*----------------------------------------------------------------------*/

// max-width 가 768px 이하일 경우, class-card 사이즈 조정
let classCardWidth = 260;
if (matchMedia) {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) {
        classCardWidth = 174;
    } else {
        classCardWidth = 260;
    }
}


function transformNext(event) {
    const slideNext = event.target;
    const slidePrev = slideNext.previousElementSibling;

    const classList = slideNext.parentElement.parentElement.nextElementSibling;
    let activeLi = classList.getAttribute('data-position');
    const liList = classList.getElementsByTagName('li');

    // 하나의 카드라도 왼쪽으로 이동했다면, 오른쪽으로 갈 수 있음
    if (Number(activeLi) < 0) {
        activeLi = Number(activeLi) + classCardWidth;

        // 왼쪽에 있던 카드가 오른쪽으로 갔다면, 다시 왼쪽으로 갈 수 있으므로 PREV 버튼 활성화
        slidePrev.style.color = '#2f3059';
        slidePrev.classList.add('slide-prev-hover');
        slidePrev.addEventListener('click', transformPrev);

        // 맨 왼쪽에 현재 보이는 카드가, 맨 첫번째 카드라면, 오른쪽 즉, NEXT 로 갈 수 없으므로 NEXT 버튼 비활성화
        if (Number(activeLi) === 0) {
            slideNext.style.color = '#cfd8dc';
            slideNext.classList.remove('slide-next-hover');
            slideNext.removeEventListener('click', transformNext);
        }
    }

    classList.style.transition = 'transform 1s';
    classList.style.transform = 'translateX(' + String(activeLi) + 'px)';
    classList.setAttribute('data-position', activeLi);    
}

function transformPrev(event) {
    // 현재 클릭 이벤트를 받은 요소, 즉 slide-prev 클래스를 가진 요소를 나타냄
    const slidePrev = event.target;
    // slide-prev 클래스를 가진 요소 다음 요소는 slide-next 클래스를 가진 요소임
    const slideNext = slidePrev.nextElementSibling;

    // ul 태그 선택
    const classList = slidePrev.parentElement.parentElement.nextElementSibling;
    let activeLi = classList.getAttribute('data-position');
    const liList = classList.getElementsByTagName('li');

  /* classList.clientWidth 는 ul 태그의 실질적인 너비
   * liList.length * classCardWidth 에서 classCardWidth 은 각 li 요소의 실질 너비(margin 포함)
   * activeLi 는 data-position 에 있는 현재 위치 
   * 즉, liList.length * classCardWidth + Number(activeLi) 는 현재 위치부터 오른쪽으로 나열되야 하는 나머지 카드들의 너비
   */

  /* classList.clientWidth < (liList.length * classCardWidth + Number(activeLi)) 의미는
   * 오른쪽으로 나열될 카드들이 넘친 상태이므로, 왼쪽으로 이동이 가능함
   */
  
   if (classList.clientWidth < (liList.length * classCardWidth + Number(activeLi))) {
       // 위치를 왼쪽으로 classCardWidth 이동 (-classCardWidthpx)
       activeLi = Number(activeLi) - classCardWidth;

       /* 위치를 왼쪽으로 classCardWidth 이동 (-classCardWidthpx)
       * 해당 위치는 변경된 activeLi 값이 적용된 liList.length * classCardWidth + Number(activeLi) 값임
       * 이 값보다, classList.clientWidth (ul 태그의 너비)가 크다는 것은
       * 넘치는 li 가 없다는 뜻으로, NEXT 버튼은 활성화되면 안됨
       */
      if (classList.clientWidth > (liList.length * classCardWidth + Number(activeLi))) {
        slidePrev.style.color = '#cfd8dc';
        slidePrev.classList.remove('slide-prev-hover');
        slidePrev.removeEventListener('click', transformPrev);
      } 

       slideNext.style.color = '#2f3059';
       slideNext.classList.add('slide-next-hover');
       slideNext.addEventListener('click', transformNext);
   }

   classList.style.transition = 'transform 1s';
   classList.style.transform = 'translateX(' + String(activeLi) + 'px)';
   classList.setAttribute('data-position', activeLi);
}

const slidePrevList = document.getElementsByClassName('slide-prev');

for (let i = 0; i < slidePrevList.length; i++) {
    // ul 태그 선택
    let classList = slidePrevList[i].parentElement.parentElement.nextElementSibling;
    let liList = classList.getElementsByTagName('li');

    // 카드가 ul 태그 너비보다 넘치면, 왼쪽(PREV) 버튼은 활성화하고, 오른쪽(NEXT)는 현재 맨 첫카드 위치이므로 비활성화
    if (classList.clientWidth < (liList.length * classCardWidth)) {
        slidePrevList[i].classList.add('slide-prev-hover');
        slidePrevList[i].addEventListener('click', transformPrev);
    } else {
        /* 카드가 ul 태그 너비보다 넘치지 않으면, PREV, NEXT 버튼 불필요하므로, 아예 삭제함
        태그 삭제시, 부모 요소에서 removeChild 를 통해 삭제해야 함
           따라서, 1. 먼저 부모 요소를 찾아서,
                 2. 부모 요소의 자식 요소로 있는 PREV 와 NEXT 요소를 삭제함
        */

       classList.style.transition = 'transform 1s';        
       const arrowContainer = slidePrevList[i].parentElement;
       slidePrevList[i].nextElementSibling.style.display = 'none';
       slidePrevList[i].style.display = 'none';
    }
}

/*----------------------------------------------------------------------*/
let touchstartX;
let touchstartY;
let currentClassList;
let currentImg;
let currentActiveLi;
let nowActiveLi;
let mouseStart;
let dragging;
let currentX;
let currentY;
let currentLiList;

function processTouchMove(event) {
  
  // preventDefault() : 해당 요소의 고유의 동작을 중단시키는 함수 (이미지만 드레그로 이동하는 고유 동작 중단)
  // 터치일 경우에는, 사용자 편의성을 위해, 브라우저 스크롤이 가능토록 해야 함
  if (event.type === "mousemove") {
    event.preventDefault();
  }
  dragging = true;

  // currentActiveLi: class-list 에서 data-position 으로 현재 카드 위치를 알아냄
  // touchstartX: 최초 요소의 x 좌표값
  // event.clientX: 드래그 중인 현재의 마우스 좌표값 
  // 즉, (Number(event.clientX) - Number(touchstartX)) 는 마우스가 얼만큼 이동중인지를 나타냄
  currentX = event.clientX || event.touches[0].screenX;
  currentY = event.clientY || event.touches[0].screenY;
  if (Math.abs(Number(currentX) - Number(touchstartX)) > Math.abs(Number(currentY) - Number(touchstartY))) {
    nowActiveLi = Number(currentActiveLi) + (Number(currentX) - Number(touchstartX));

    // console.log(nowActiveLi, currentClassList.clientWidth, (currentLiList.length * classCardWidth + Number(nowActiveLi)));
    // 바로 즉시 마우스 위치에 따라, 카드를 이동함
    currentClassList.style.transition = 'transform 0s linear';
    currentClassList.style.transform = 'translateX(' + String(nowActiveLi) + 'px)';    
  } else {
      if (event.type !== "mousemove") {
        currentClassList.removeEventListener('mousemove', processTouchMove);        
        currentClassList.removeEventListener('mouseup', processTouchEnd);  
    
        currentClassList.removeEventListener('touchmove', processTouchMove);        
        currentClassList.removeEventListener('touchend', processTouchEnd);          
    
        mouseStart = false;
      }
  }

}

function processTouchStart(event) {
    mouseStart = true;
    dragging = false;
    

    // preventDefault() : 해당 요소의 고유의 동작을 중단시키는 함수 (이미지만 드레그로 이동하는 고유 동작 중단)
    // 터치일 경우에는, 사용자 편의성을 위해, 브라우저 스크롤이 가능토록 해야 함
    if (event.type === "mousedown") {
        event.preventDefault();
    }
    touchstartX = event.clientX || event.touches[0].screenX;
    touchstartY = event.clientY || event.touches[0].screenY;
    currentImg = event.currentTarget; // addEventListener 에 등록된 요소와 실제 이벤트가 발생한 요소는 다를 수 있음 (자식 요소등)
    currentClassList = currentImg.parentElement;

    // 드래그 처리를 위해, 드래그 중(mousemove), 드래그가 끝났을 때(mouseup) 에 이벤트를 걸어줌
    currentClassList.addEventListener('mousemove', processTouchMove);
    currentClassList.addEventListener('mouseup', processTouchEnd);

    currentClassList.addEventListener('touchmove', processTouchMove);
    currentClassList.addEventListener('touchend', processTouchEnd);    

    currentLiList = currentClassList.getElementsByTagName('li');
    currentActiveLi = currentClassList.getAttribute('data-position');

}

function processTouchEnd(event) {
    // preventDefault() : 해당 요소의 고유의 동작을 중단시키는 함수 (이미지만 드레그로 이동하는 고유 동작 중단)
    // 터치일 경우에는, 사용자 편의성을 위해, 브라우저 스크롤이 가능토록 해야 함
    if (event.type === "mouseup") {
        event.preventDefault();
    }
    
    if (mouseStart === true) {
        currentClassList.removeEventListener('mousemove', processTouchMove);        
        currentClassList.removeEventListener('mouseup', processTouchEnd);  

        currentClassList.removeEventListener('touchmove', processTouchMove);        
        currentClassList.removeEventListener('touchend', processTouchEnd);          
        
        nowActiveLi = Number(currentActiveLi) + (Number(currentX) - Number(touchstartX));
        
        // 바로 즉시 마우스 위치에 따라, 카드를 이동함
        console.log((Number(currentX) - Number(touchstartX)));
        console.log(currentClassList.clientWidth < (currentLiList.length * classCardWidth + Number(nowActiveLi)));
        if (currentClassList.clientWidth < (currentLiList.length * classCardWidth + Number(nowActiveLi))) {
            if ((Number(currentX) - Number(touchstartX)) >= 0) {
                console.log(nowActiveLi / classCardWidth);
                console.log(Math.ceil(nowActiveLi / classCardWidth));
                nowActiveLi = Math.ceil(nowActiveLi / classCardWidth) * classCardWidth;
            } else {
                console.log(nowActiveLi / classCardWidth);
                console.log(Math.floor(nowActiveLi / classCardWidth));
                nowActiveLi = Math.floor(nowActiveLi / classCardWidth) * classCardWidth;
            }
            
        } else {
            if ((Number(currentX) - Number(touchstartX)) >= 0) {
                console.log((currentLiList.length * classCardWidth - currentClassList.clientWidth) / classCardWidth);
                nowActiveLi = Math.floor((currentLiList.length * classCardWidth - currentClassList.clientWidth) / classCardWidth) * -1 * classCardWidth;
            } else {
                console.log((currentLiList.length * classCardWidth - currentClassList.clientWidth) / classCardWidth);
                console.log(Math.ceil((currentLiList.length * classCardWidth - currentClassList.clientWidth) / classCardWidth));
                nowActiveLi = Math.ceil((currentLiList.length * classCardWidth - currentClassList.clientWidth) / classCardWidth) * -1 * classCardWidth;
            }
        }
        if (nowActiveLi < 0) {
            if (currentClassList.clientWidth < ((currentLiList.length * classCardWidth) + Number(nowActiveLi))) {
                currentClassList.style.transition = 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)';
                currentClassList.style.transform = 'translateX(' + String(nowActiveLi) + 'px)';
                currentClassList.setAttribute('data-position', nowActiveLi);
            } else {
                currentClassList.style.transition = 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)';
                currentClassList.style.transform = 'translateX(' + String(nowActiveLi) + 'px)';
                currentClassList.setAttribute('data-position', nowActiveLi);
            }
        } else {
            currentClassList.style.transition = 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)';
            currentClassList.style.transform = 'translateX(0px)';
            currentClassList.setAttribute('data-position', 0);
            nowActiveLi = 0;
        }

        const slidePrev = currentClassList.previousElementSibling.children[1].children[0];
        const slideNext = currentClassList.previousElementSibling.children[1].children[1];

        if (nowActiveLi < currentActiveLi) {
            // 왼쪽에 있던 카드가 오른쪽으로 갔다면, 다시 왼쪽으로 갈 수 있으므로 PREV 버튼 활성화
            if (currentClassList.clientWidth < (currentLiList.length * classCardWidth + Number(nowActiveLi))) {
                slidePrev.style.color = '#2f3059';
                slidePrev.classList.add('slide-prev-hover');
                slidePrev.addEventListener('click', transformPrev);
            } else {
                slidePrev.style.color = '#cfd8dc';
                slidePrev.classList.remove('slide-prev-hover');
                slidePrev.removeEventListener('click', transformPrev);                
            }
            slideNext.style.color = '#2f3059';
            slideNext.classList.add('slide-next-hover');
            slideNext.addEventListener('click', transformNext);

        } else {
            if (currentClassList.clientWidth > (currentLiList.length * classCardWidth + Number(nowActiveLi))) {
                slidePrev.style.color = '#cfd8dc';
                slidePrev.classList.remove('slide-prev-hover');
                slidePrev.removeEventListener('click', transformPrev);
            } else {
                slidePrev.style.color = '#2f3059';
                slidePrev.classList.add('slide-prev-hover');
                slidePrev.addEventListener('click', transformPrev);
            }
        
            // 맨 왼쪽에 현재 보이는 카드가, 맨 첫번째 카드라면, 오른쪽 즉, NEXT 로 갈 수 없으므로 NEXT 버튼 비활성화
            if (Number(nowActiveLi) === 0) {
                slideNext.style.color = '#cfd8dc';
                slideNext.classList.remove('slide-next-hover');
                slideNext.removeEventListener('click', transformNext);
            }
        }


        /*
        // 맨 처음 카드가 맨 앞에 배치되도록 초기 상태로 이동
        currentClassList.style.transition = 'transform 1s ease';
        currentClassList.style.transform = 'translateX(0px)';
        currentClassList.setAttribute('data-position', 0);

        // 맨 처음 카드가 맨 앞에 배치된 상태로 화살표 버튼도 초기 상태로 변경
        let eachSlidePrev = currentClassList.previousElementSibling.children[1].children[0];
        let eachSlideNext = currentClassList.previousElementSibling.children[1].children[1];
        let eachLiList = currentClassList.getElementsByTagName('li');
        if (currentClassList.clientWidth < (eachLiList.length * classCardWidth)) {
            eachSlidePrev.style.color = '#2f3059';
            eachSlidePrev.classList.add('slide-prev-hover');
            eachSlidePrev.addEventListener('click', transformPrev);

            eachSlideNext.style.color = '#cfd8dc';
            eachSlideNext.classList.remove('slide-next-hover');
            eachSlideNext.removeEventListener('click', transformNext);            
        }
        */


        mouseStart = false;
    }
}

function preventClick(event) {
    if (dragging === true) {
        dragging = false;
        event.preventDefault();
    }
}
// 특정 요소를 드래그하다가, 요소 밖에서 드래그를 끝낼 수 있으므로, window 에 이벤트를 걸어줌
window.addEventListener('dragend', processTouchEnd);
window.addEventListener('mouseup', processTouchEnd);

// 인터페이스간의 오동작을 막기 위해, 카드 내의 이미지에만 드래그 인터페이스를 제공하기로 함 
const classImgLists = document.querySelectorAll('ul a');
for (let i = 0; i < classImgLists.length; i++) {
    // 해당 요소에 마우스를 누르면, 드래그를 시작할 수 있으므로, 이벤트를 걸어줌
    classImgLists[i].addEventListener('mousedown', processTouchStart);
    classImgLists[i].addEventListener('touchstart', processTouchStart, { passive: true });
    classImgLists[i].addEventListener('click', preventClick);
}
