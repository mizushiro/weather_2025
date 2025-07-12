export default class RadioSelection {
   constructor(opt) {
    const defaults = {
      data: null,
      type: 'radio', //radio, checkbox
      callback: null,
    }
    this.option = { ...defaults, ...opt };
    this.selection = document.querySelector(`[data-selection="${this.option.id}"]`);
    this.data = this.option.data;
    this.label = this.option.label;
    this.type = this.option.type;
    this.item = null;
    this.callback = this.option.callback;
    this.init();
  }

  init() {
    let buttonTag = ``;
    this.selection.setAttribute('aria-label', this.label);
    this.selection.setAttribute('role', this.type === 'radio' ? 'radiogroup' : 'group');
    if (this.data !== null) {
      this.data.forEach(item => {
        if (this.type === 'radio') {
          buttonTag += `<button type="button" role="radio" data-value="${item.value}" aria-checked="${item.checked}"><span>${item.text}</span></button>`;
        } else {
          buttonTag += `<button type="button" role="checkbox" data-value="${item.value}" aria-checked="${item.checked}"><span>${item.text}</span></button>`;
        }
      });
      this.selection.innerHTML = buttonTag;
    }
    this.item = this.selection.querySelectorAll('[role="radio"]');
    const itemsArray = Array.from(this.item);
    this.item.forEach(item => {
			const keyHandler = (e) => {
				const key = e.key;
				let dir = 0;

				if (key === 'ArrowRight' || key === 'ArrowDown') dir = 1;
				else if (key === 'ArrowLeft' || key === 'ArrowUp') dir = -1;
				else return;

				e.preventDefault();

				// 현재 인덱스 → 다음 인덱스 계산 (순환)
				const currentIndex = itemsArray.indexOf(item);
				const nextIndex = (currentIndex + dir + this.item.length) % this.item.length;
				const nextItem = this.item[nextIndex];
				
				this.moveKey(nextItem);
			};

      item.addEventListener('click', this.updateSelection.bind(this));
			item.addEventListener('keydown', keyHandler);
			item.setAttribute('tabindex', item.getAttribute('aria-checked') === 'true' ? '0' : '-1');
    });
  } 

  updateSelection = (e) => {
    const _this = e.currentTarget;
		const wrap = _this.closest('[data-selection]');
    const thisValue = _this.dataset.value;
    const selected = wrap.querySelector('[role="radio"][aria-checked="true"]');

    selected.setAttribute('aria-checked', false);
    selected.setAttribute('tabindex', '-1');
    _this.setAttribute('aria-checked', true);
    _this.setAttribute('tabindex', '0');
    this.callback && this.callback(_this, thisValue);
  }

	moveKey = (btn) => {
    const wrap = btn.closest('[data-selection]');
		const items = wrap.querySelectorAll('[role="radio"]');
		items.forEach(item => {
			item.setAttribute('tabindex', '-1');
		});
		btn.setAttribute('tabindex', '0');
		btn.focus();
  }
}