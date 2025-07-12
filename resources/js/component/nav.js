export default class Nav {
  constructor(opt) {
    this.id = opt.id;
    this.navDepth1 = document.querySelector(`[data-nav="Depth-1"][data-id="${this.id}"]`);
    this.navDepth1_wrap = this.navDepth1.querySelector('[data-nav="Depth-1-wrap"]');
    this.navDepth1_items = this.navDepth1_wrap.querySelectorAll('[data-nav="Depth-1-item"]');
    this.navDepth1_buttons = this.navDepth1_wrap.querySelectorAll('[data-nav="Depth-1-button"]');
    this.eventActExpanded = this.actExpanded.bind(this);
    this.eventActKey = this.actKey.bind(this);
    this.currentFocusedDepth2Button = null; // 현재 포커스된 2-depth 버튼을 추적합니다.
  }

  init() {
    this.navDepth1_buttons.forEach(item => {
      item.addEventListener('click', this.eventActExpanded);
    });
  }
  actExpanded(e) {
    const _this = e.currentTarget;
    const controlID = _this.getAttribute('aria-controls');
    const isExpanded = _this.getAttribute('aria-expanded') === 'true' ? true : false;
    const navDepth2 = document.querySelector(`#${controlID}`);
    const navDepth2_buttons =  Array.from(navDepth2.querySelectorAll('[data-nav="Depth-2-button"]')); // NodeList를 배열로 변환

    const this_button = this.navDepth1_wrap.querySelector('[data-nav="Depth-1-button"][aria-expanded="true"]');
    const this_pnl = this.navDepth1_wrap.querySelector('[data-nav="Depth-2"][aria-hidden="false"]');

    // 이전에 열려있던 Depth-1 메뉴 닫기
    if (this_button && this_button !== _this) {
      this_button.setAttribute('aria-expanded', false);
      this_pnl.setAttribute('aria-hidden', true);
      // 이전 2-depth 버튼에서 키보드 이벤트를 제거합니다.
      const prevNavDepth2Buttons = Array.from(this_pnl.querySelectorAll('[data-nav="Depth-2-button"]'));
      prevNavDepth2Buttons.forEach(item => {
        item.removeEventListener('keydown', this.eventActKey);
      });
    }

    if (!isExpanded) {
      _this.setAttribute('aria-expanded', true);
      navDepth2.setAttribute('aria-hidden', false);

      if (navDepth2_buttons.length > 0) {
        navDepth2_buttons[0].focus();
        this.currentFocusedDepth2Button = navDepth2_buttons[0]; // 첫 번째 버튼으로 설정
      }
      
      navDepth2_buttons.forEach(item => {
        item.addEventListener('keydown', this.eventActKey);
      });
    } else {
      
    }
  }
  actKey(e) {
    console.log(e.key);
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowrRght':
        e.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        break;
    }
  }
}