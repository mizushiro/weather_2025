import { loadContent } from '../utils/loadContent.js';

export default class Tab {
  constructor(opt) {
		const defaults = {
			renderMode: 'static', 
			data: null, 
		};

		this.option = { ...defaults, ...opt };
    this.renderMode = this.option.renderMode;
    this.data = this.option.data;
    this.id = this.option.id;

    this.el_tab = document.querySelector(`[data-tab="${this.id}"]`);
    this.el_wrap = document.querySelector(`[data-tab-wrap="${this.id}"]`);
    this.el_tabBtns = null;
    this.el_tabPnls = null;

    this.init();
  }

  init() {
    let tablist_html = ``;
    let tabpanel_html = ``;
    this.data.forEach((item, index) => {
      const n = index + 1;
      tablist_html += `<button type="button" role="tab" aria-selected="${item.selected}" aria-controls="${this.id}-panel-${n}" tabindex="${item.selected ? 0 : '-1'}" id="${this.id}-id-${n}">${item.tab}</li>`;
      tabpanel_html += `<div role="tabpanel" aria-labelledby="${this.id}-id-${n}" id="${this.id}-panel-${n}" aria-expanded="${item.selected}" tabindex="${item.selected ? 0 : '-1'}"></div>`;
    });
    this.el_tab.innerHTML = tablist_html;
    this.el_wrap.innerHTML = tabpanel_html;

    this.data.forEach((item, index) => {
      const n = index + 1;

      loadContent({
        area: this.el_wrap.querySelector(`#${this.id}-panel-${n}`),
        src: item.src,
        insert: true,
      })
      .then(() => {
        (item.callback && item.selected) && item.callback();
      })
      .catch(err => console.error('Error loading tab content:', err));

    });
    
    this.el_tabBtns = this.el_tab.querySelectorAll('[role="tab"]')
    this.el_tabBtns.forEach((item, index) => {
      item.addEventListener('click', this.handleToggle.bind(this));
    });
  }

  handleToggle (e) {
    const _this = e.currentTarget;
    const _wrap = _this.closest('[role="tablist"]');
    const tabSelected = _wrap.querySelector('[role="tab"][aria-selected="true"]');
    const tabID = _this.id;

    tabSelected.setAttribute('aria-selected', false);
    _this.setAttribute('aria-selected', true);

    this.expanded(_this.id);
  }

  expanded (id) {
    const tabID = id;
    const _this = document.querySelector(`#${tabID}`);
    const _wrap = _this.closest('[role="tablist"]');
    const tabName = _wrap.dataset.tab;
    const tabSelected = _wrap.querySelector('[role="tab"][aria-selected="true"]');
    const panelWrap = document.querySelector(`[data-tab-wrap="${tabName}"]`);
    const panelSelected = panelWrap.querySelector(`[role="tabpanel"][aria-expanded="true"]`);
    const currentPanel = panelWrap.querySelector(`[role="tabpanel"][aria-labelledby="${tabID}"]`);

    // tab button
    tabSelected.setAttribute('aria-selected', false);
    _this.setAttribute('aria-selected', true);
    // tab panel
    panelSelected.setAttribute('aria-expanded', false);
    panelSelected.setAttribute('tabindex', '-1');
    currentPanel.setAttribute('aria-expanded', true);
    currentPanel.setAttribute('tabindex', 0);
  }
}