export default class Drag {
  constructor(opt) {
    const defaults = {
      rotate: true,
      angle: 1,
      unit: 1,
    }

    this.option = { ...defaults, ...opt };
    this.id =  this.option.id;
    this.unit = this.option.unit;
    this.angle = this.option.angle;

    this.drag = document.querySelector(`[data-dragdrop="${this.id}"]`);
    this.areas = this.drag.querySelectorAll('[data-dragdrop-target="item"]');
    this.items = this.drag.querySelectorAll('[data-dragdrop-object="item"]');
    this.areaPsData = [];

    this.boundEventStart = this.actEventStart.bind(this);
    this.boundKeyStart = this.keyStart.bind(this);
    this.boundKeyMove = this.keyMove.bind(this);

    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.eventStart = this.isTouchDevice ? 'touchstart' : 'mousedown';
    this.timerControl = null;

    this.shiftPressed = false;
    this.lastArrowKey = null;
    this.repeatTimer = null;

    this.init();
  }

  init() {
    console.log(this.items);
    this.areas.forEach(item => {
      const area_rect = item.getBoundingClientRect();
      this.areaPsData.push({
        x: [area_rect.left, area_rect.left + area_rect.width],
        y: [area_rect.top, area_rect.top + area_rect.height],
        target: item,
        info: area_rect,
      })
    });
    this.items.forEach(item => {
      const evt = item.querySelector('[data-dragdrop-object="event"]');
      
      evt.addEventListener(this.eventStart, this.boundEventStart);
      evt.addEventListener('keydown', this.boundKeyStart);
    });
  }
  contralTab(target, v) {
    const wrap = target;
    const tabs = wrap.querySelectorAll('button');
    const select_tab = wrap.querySelector('[aria-selected="true"]');

    const actTab = e => {
      const _this = e.currentTarget;
      let mode = _this.dataset.dragdropContral;

      if (mode === 'reversal' || mode === 'delete') {
        mode = 'move';
      }
 
      tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
      });
      _this.closest('[data-dragdrop-object="item"]').dataset.mode = mode === undefined ? 'move' : mode;
      _this.setAttribute('aria-selected', 'true');

      wrap.dataset.controlView = 'off';
    }
    tabs.forEach(tab => {
      tab.addEventListener('click', actTab);
    });
  }
  actEventStart(e) {
    console.log(e);
    const el_this = e.currentTarget;
    const el_item = el_this.closest('[data-dragdrop-object="item"]');
    const el_wrap = el_this.closest('[data-dragdrop-object="wrap"]');
    const el_img = el_item.querySelector('[data-dragdrop-object="img"]');
    const isMode = el_item.dataset.mode;
    const isClone = el_item.dataset.clone && el_item.dataset.this === 'original' ? Number(el_item.dataset.clone) : false;
    const clone_item = el_item.cloneNode(true);

    let this_item = el_item;
    let this_event = el_item.querySelector('[data-dragdrop-object="event"]');
    let rect_item = el_item.getBoundingClientRect();
    if (!!isClone) {
      clone_item.dataset.this = 'clone';
      el_wrap.insertAdjacentElement('beforeend', clone_item);

      this_item = clone_item;
      this_event = clone_item.querySelector('[data-dragdrop-object="event"]');
      rect_item = clone_item.getBoundingClientRect();
      this_event.focus();
      this.contralTab(this_item);
    }
    this_item.dataset.controlView = 'on';
    
    const btnDel = this_item.querySelector('[data-dragdrop-contral="delete"]');
    const btnRotate = this_item.querySelector('[data-dragdrop-contral="rotate"]');
    const btnRever = this_item.querySelector('[data-dragdrop-contral="reversal"]');
    
    //position
    const isTouchEvent = e.type.startsWith('touch');
    const eventMove = isTouchEvent ? 'touchmove' : 'mousemove';
    const eventEnd = isTouchEvent ? 'touchend' : 'mouseup';
    const y = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
    const x = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

    const item_rect = e.currentTarget.getBoundingClientRect();
    const centerX = item_rect.left + item_rect.width / 2;
    const centerY = item_rect.top + item_rect.height / 2;

    let newRotate = 0;
    let startAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    startAngle = Math.round(startAngle); // 정수 변환
    let currentRotate = 0;
    const transform = el_img.style.transform.match(/rotate\((-?\d+)deg\)/);
    if (transform) {
      currentRotate = parseInt(transform[1], 10);
    }

    //move ------------------------------
    const actMove = e => {
      e.preventDefault();
      const y_m = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
      const x_m = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

      if (isClone) {
        //original
        const m_x = x_m - x;
        const m_y = y_m - y;

        this_item.style.transform = 'translate(' + m_x / 10 + 'rem, ' + m_y / 10 + 'rem)';
      } else {
        //clone
        const target_rect = this_item.closest('[data-dragdrop-target="item"]').getBoundingClientRect();
        const m_x = x_m - target_rect.left - (rect_item.width / 2);
        const m_y = y_m - target_rect.top - (rect_item.height / 2);

        this_item.style.transform = 'translate(' + m_x / 10 + 'rem, ' + m_y / 10 + 'rem)';
      }
    };
    const actMoveEnd = e => {
      e.preventDefault();
      document.removeEventListener(eventMove, actMove);
      document.removeEventListener(eventEnd, actMoveEnd);

      const eventStart = isTouchEvent ? 'touchstart' : 'mousedown';
      const end_rect = this_item.getBoundingClientRect();
      const end_ps =  {
        x: [end_rect.left, end_rect.left + end_rect.width],
        y: [end_rect.top, end_rect.top + end_rect.height]
      }
                    
      let inSuccess = false;
      this.areaPsData.forEach(area => {
        area.target.dataset.answer = '';

        //영역 in 
        if (area.x[0] - this.unit <= end_ps.x[0] && area.x[1] + this.unit >= end_ps.x[1] && area.y[0] - this.unit <= end_ps.y[0] && area.y[1] + this.unit >= end_ps.y[1]) {          
          inSuccess = true;
          area.target.appendChild(this_item);
          const x = Math.round((end_rect.left - area.x[0]) / this.unit) * this.unit;
          const y = Math.round((end_rect.top - area.y[0]) / this.unit) * this.unit;
          this_item.style.transform = 'translate(' + x / 10 + 'rem, ' + y / 10 + 'rem)';
        } 

        if (!inSuccess) {
          //영역 out
          this_item.remove();
        } else {
          //영역 in
          this_event.addEventListener('keydown', this.boundKeyMove);
          this_event.addEventListener(eventStart, this.boundEventStart);
          this_event.focus()
          this_item.dataset.controlView = 'off';
        }
      });

      if (this_item.closest('[data-dragdrop-target="item"]')) {
        if (this_item.dataset.value === this_item.closest('[data-dragdrop-target="item"]').dataset.value) {
          this_item.dataset.answer = 'O';
          this_item.closest('[data-dragdrop-target="item"]').dataset.answer = 'O';
        } else {
          this_item.dataset.answer = 'X';
          this_item.closest('[data-dragdrop-target="item"]').dataset.answer = 'X';
        }
      }
    };

    //rotate ----------------------------
    const actRotateMove = e => {
      const y_m = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
      const x_m = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

      // 현재 마우스 위치의 각도 계산
      let newAngle = Math.atan2(y_m - centerY, x_m - centerX) * (180 / Math.PI);
      newAngle = Math.round(newAngle); // 정수 변환

      // 각도 차이 계산
      let angleDiff = newAngle - startAngle;

      // 각도 차이 보정 (180도 이상 차이 나면 반대 방향으로 보정)
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      newRotate = currentRotate + angleDiff;

      // 0~359도 범위 유지
      newRotate = (newRotate + 360) % 360;
      el_img.style.transform = `rotate(${newRotate}deg)`;

      currentRotate = newRotate;
      startAngle = newAngle;
      el_this.dataset.rotate = newRotate;
    };
    const actRotateEnd = () => {
      if (this.angle) {          
        let angle = Math.round(newRotate / this.angle) * this.angle;
        el_img.style.transform = `rotate(${angle}deg)`;
      } 
      document.removeEventListener(eventMove, actRotateMove);
      document.removeEventListener(eventEnd, actRotateEnd);
      el_item.dataset.mode = 'move';
      this.drag.querySelector('[data-dragdrop-contral="group"] [aria-selected="true"]').setAttribute('aria-selected', false);
      // this.drag.querySelector('[data-dragdrop-contral="group"] [data-dragdrop-contral="move"]').setAttribute('aria-selected', true);
      this_item.dataset.controlView = 'off';
    };

    //delete
    const actDel = () => {
      this_item.remove();
      el_this.focus();
    };

    const actRever = e => {
      const el_this = e.currentTarget;
      const el_item = el_this.closest('[data-dragdrop-object="item"]');
      const el_img = el_item.querySelector('[data-dragdrop-object="img"]');
      
      if (el_img.dataset.rever === 'on') {
        el_img.dataset.rever="off";
      } else {
        el_img.dataset.rever="on";
      }
    }

    //event
    if (isMode === 'move') {
      document.addEventListener(eventMove, actMove, { passive: false });
      document.addEventListener(eventEnd, actMoveEnd);
    }
    if (isMode === 'rotate') {
      document.addEventListener(eventMove, actRotateMove, { passive: false });
      document.addEventListener(eventEnd, actRotateEnd);
    }
    
    btnDel.addEventListener('click', actDel);
    btnRotate.addEventListener('click', this.rotateStart);
    btnRever.addEventListener('click', actRever);
  }

  keyStart(e) {
    switch(e.code) {
      case 'Space' :
      case 'Enter' :
        e.preventDefault();
        const el_this = e.currentTarget;
        const el_item = el_this.closest('[data-dragdrop-object="item"]');
        const isMode = el_item.dataset.mode;
        const isClone = el_item.dataset.clone && el_item.dataset.this === 'original' ? Number(el_item.dataset.clone) : false;
        const clone_item = el_item.cloneNode(true);

        let this_item = el_item;
        let this_event = el_item.querySelector('[data-dragdrop-object="event"]');
        let rect_item = el_item.getBoundingClientRect();

        if (!!isClone) {
          clone_item.dataset.this = 'clone';
          clone_item.style.transform = `translate(0rem, 0rem)`;
          let area_current = null;
          this.areas.forEach(item => {
            if (item.dataset.value === clone_item.dataset.value) {
              area_current = item;
            }
          })

          area_current.insertAdjacentElement('beforeend', clone_item);

          this_item = clone_item;
          this_event = clone_item.querySelector('[data-dragdrop-object="event"]');
          rect_item = clone_item.getBoundingClientRect();
          this_event.focus();
          this.contralTab(this_item);
        }
        this_item.dataset.controlView = 'on';
        
        // touch, mouse event
        this_event.addEventListener(this.eventStart, this.boundEventStart);
        this_event.addEventListener('keydown', this.boundKeyMove);
        break;

      default:
        console.log('스페이스나 엔터로 복사하고 방향키로 이동해주세요')
    }
  }
  keyMove(e) {
    console.log(e);
    
    const el_this = e.currentTarget;
    const el_item = el_this.closest('[data-dragdrop-object="item"]');
    const el_img = el_item.querySelector('[data-dragdrop-object="img"]');
    const el_wrap = el_this.closest('[data-dragdrop-target="item"]');
    const wrap_rect = el_wrap.getBoundingClientRect();
    const item_rect = el_item.getBoundingClientRect();
    const transform = el_item.style.transform;
    const match = transform.match(/translate\(\s*([^\s,]+),\s*([^\s,]+)\)/);
    let x = parseFloat(match[1]);
    let y = parseFloat(match[2]);
    const unitText = match[1].replace(/[0-9.\-]/g, '');
    let mx = null;
    let my = null;
    let currentRotate = 0;

    const img_transform = el_img.style.transform.match(/rotate\((-?\d+)deg\)/);
    if (img_transform) {
      currentRotate = parseInt(img_transform[1], 10);
    }
    
    if (e.key === 'Shift') {
      this.shiftPressed = this.shiftPressed ? false : true;

      if (this.shiftPressed) {
        el_item.dataset.mode = 'rotate';
      } else {
        el_item.dataset.mode = 'move';
      }
    }
    
    if (unitText === 'rem') {
      x = x * 10;
      y = y * 10;
    }
    console.log(e);
    switch(e.code) {
      case 'ArrowLeft' :
      e.preventDefault();
      if (this.shiftPressed) {
        let newRotate = currentRotate - this.angle;

        console.log(newRotate)
        if (newRotate < 0) {
          newRotate = 360 - Math.abs(newRotate);
        }
        el_img.style.transform = `rotate(${newRotate}deg)`;
      } else {
        mx = x - this.unit;
        mx < 0 ? mx = 0 : mx >= wrap_rect.width - item_rect.width ?  mx = wrap_rect.width - item_rect.width : '';
        el_item.style.transform = `translate(${mx / 10 + unitText}, ${y / 10 + unitText})`;
      }
      break;

      case 'ArrowRight' :
      e.preventDefault();
      if (this.shiftPressed) {
        let newRotate = currentRotate + this.angle;
        if (newRotate > 360) {
          newRotate = newRotate - 360;
        }
        el_img.style.transform = `rotate(${newRotate}deg)`;
      } else {
        mx = x + this.unit;
        mx < 0 ? mx = 0 : mx >= wrap_rect.width - item_rect.width ? mx = wrap_rect.width - item_rect.width : '';
        el_item.style.transform = `translate(${mx / 10 + unitText}, ${y / 10 + unitText})`;
      }
      break;
 
      case 'ArrowUp' :
      e.preventDefault();
      if (this.shiftPressed) {
        let newRotate = currentRotate - this.angle;
        if (newRotate < 0) {
          newRotate = 360 - Math.abs(newRotate);
        }
        el_img.style.transform = `rotate(${newRotate}deg)`;
      } else {
        my = y - this.unit;
        my < 0 ? my = 0 : my >= wrap_rect.height - item_rect.height ? my = wrap_rect.height - item_rect.height : '';
        el_item.style.transform = `translate(${x / 10 + unitText}, ${my / 10 + unitText})`;
      }
      break;

      case 'ArrowDown' :
      e.preventDefault();
      if (this.shiftPressed) {
        let newRotate = currentRotate + this.angle;
        if (newRotate > 360) {
          newRotate = newRotate - 360;
        }
        el_img.style.transform = `rotate(${newRotate}deg)`;
      } else {
        my = y + this.unit;
        my < 0 ? my = 0 : my >= wrap_rect.height - item_rect.height ? my = wrap_rect.height - item_rect.height : '';
        el_item.style.transform = `translate(${x / 10 + unitText}, ${my / 10 + unitText})`;
      }
      break;
    }
  }
}