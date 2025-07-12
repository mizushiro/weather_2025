import Dialog from './component/dialog.js';
import Drag from './component/drag.js';
import Dropdown from './component/dropdown.js';
import Tab from './component/tab.js';

import { loadContent } from './utils/loadContent.js';

export const PrimoUX = {
	Dialog,
	Drag,
	Tab,
	Dropdown,
	
	init: () => {
		const global = 'UI';
		if (!window[global]) {
			window[global] = {};
		}
		const Global = window[global];

		Global.exe = {}
		Global.dev = {}

	},
	header: () => {
		//header
		loadContent({
			area: document.querySelector('.base-header'),
			src: './inc/header.html',
			insert: true
		})
		.then(() => {
			const el_header = document.querySelector('.base-header');
			
			const ManiNav = new Nav({
				id: 'main-nav'
			});
			ManiNav.init();

		})
		.catch(err => console.error('Error loading header content:', err));
	},
	utils: {
		loadContent,
	}
}

