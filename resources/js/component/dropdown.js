export default class Dropdown {
  constructor(opt) {
    this.id = opt.id;
    this.callback = opt.callback;
    this.wrap = document.querySelector(`[data-dropdown="${this.id}"]`);
    this.button = this.wrap.querySelector(`[data-dropdown-button]`);
    this.text = this.button.querySelector(`[data-dropdown-text]`);
    this.panel = this.wrap.querySelector(`[data-dropdown-panel]`);
    this.radioButtons = this.panel.querySelectorAll('[role="radio"]');

    this.init();
  }

  init() {
    //setting
    this.text.dataset.dropdownText = this.id;
    this.button.dataset.dropdownButton = this.id;
    this.button.setAttribute('aria-controls', this.id);
    this.button.setAttribute('aria-expanded', false);
    this.panel.dataset.dropdownPanel = this.id;
    this.panel.setAttribute('aria-hidden', true);
    this.panel.setAttribute('tabindex', '-1');
    this.panel.id = this.id;

    this.button.addEventListener('click', this.handleToggle);

    this.callback && this.callback();
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