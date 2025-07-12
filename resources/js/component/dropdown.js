export default class Dropdown {
  constructor(opt) {
    this.id = opt.id;
    this.wrap = document.querySelector(`[data-dropdown="${this.id}"]`);
    this.button = this.wrap.querySelector(`[data-dropdown-button]`);
    this.text = this.button.querySelector(`[data-dropdown-text]`);
    this.panel = this.wrap.querySelector(`[data-dropdown-panel]`);
    this.radioButtons = this.panel.querySelectorAll('[role="radio"]');

    this.init();
  }

  init() {
    //setting
    this.button.dataset.dropdownButton = this.id;
    this.button.setAttribute('aria-controls', this.id);
    this.button.setAttribute('aria-expanded', false);
    this.panel.dataset.dropdownPanel = this.id;
    this.panel.setAttribute('aria-hidden', true);
    this.panel.setAttribute('tabindex', '-1');
    this.panel.id = this.id;

    this.button.addEventListener('click', this.handleToggle);
    if (this.radioButtons) {
      this.radioButtons.forEach(item => {
        item.addEventListener('click', this.handleSelect);
      });
    }
  }

  handleSelect = (e) => {
    const _this = e.currentTarget;
    const dataText = _this.textContent;
    const selected = this.panel.querySelector('[role="radio"][aria-checked="true"]');

    selected.setAttribute('aria-checked', false);
    _this.setAttribute('aria-checked', true);
    this.text.textContent = dataText;
    this.hide();
  }

  handleToggle = (e) => {
    const _this = e.currentTarget;
    const isExpanded = _this.getAttribute('aria-expanded');
    const _name = _this.dataset.dropdownButton;
    
    this.panel = document.querySelector(`[data-dropdown-panel="${_name}"]`);
    isExpanded === 'false' ? this.show() : this.hide();
  }

  show() {
    this.button.setAttribute('aria-expanded', true);
    this.panel.setAttribute('aria-hidden', false);
    this.panel.focus();
  }
  
  hide() {
    this.button.setAttribute('aria-expanded', false);
    this.panel.setAttribute('aria-hidden', true);
    this.button.focus();
  }
}