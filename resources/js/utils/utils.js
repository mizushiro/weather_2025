/**
 * Loads content from a specified source and inserts it into a DOM element.
 * @param {Object} options - Options for the function.
 * @param {Element} options.area - The DOM element where content will be inserted.
 * @param {string} options.src - The source URL to fetch content from.
 * @param {boolean} [options.insert=false] - Whether to insert content at the beginning or replace it.
 * @param {Function|null} [options.callback=null] - A callback function to execute after loading content.
 * @returns {Promise<string>} A promise that resolves with the fetched content.
 * 
 	 loadContent({
			area: document.querySelector('불러올 영역'),
			src: '파일경로',
			insert: true
		})
		.then(() => {
			//로드 후 실행
		})
		.catch(err => console.error('Error loading header content:', err));
*/
export const loadContent = ({ area, src, insert = false, callback = null }) => {
	return new Promise((resolve, reject) => {
		if (!(area instanceof Element)) {
			console.error('Invalid selector provided.');
			reject(new Error('Invalid DOM element.'));
			return;
		}
		if (!src) {
			reject(new Error('Source (src) is required'));
			return;
		}

		fetch(src)
			.then(response => {
				if (!response.ok) throw new Error(`Failed to fetch ${src}`);
				return response.text();
			})
			.then(result => {
				insert ? area.insertAdjacentHTML('afterbegin', result) : area.innerHTML = result;
				if (callback) callback();
				resolve(result);
			})
			.catch(error => reject(error));
	});
};

const radioHandlerMap = new WeakMap();
const keyHandlerMap = new WeakMap();
export const radioSelection = (opt) => {
	const callback = opt.callback;
  const radioGroups = document.querySelectorAll('[role="radiogroup"]');

	const updateSelection = (e) => {
    const _this = e.currentTarget;
		const wrap = _this.closest('[role="radiogroup"]');
    const thisValue = _this.dataset.value;
    const selected = wrap.querySelector('[role="radio"][aria-checked="true"]');

    selected.setAttribute('aria-checked', false);
    selected.setAttribute('tabindex', '-1');
    _this.setAttribute('aria-checked', true);
    _this.setAttribute('tabindex', '0');

		console.log(_this, thisValue)
    callback(_this, thisValue);
  }

	const moveKey = (radio) => {
    const wrap = radio.closest('[role="radiogroup"]');
		const _radios = wrap.querySelectorAll('[role="radio"]');
		_radios.forEach(item => {
			item.setAttribute('tabindex', '-1');
		});
		radio.setAttribute('tabindex', '0');
		radio.focus();
  }
	
	radioGroups.forEach(group => {
		const radios = group.querySelectorAll('[role="radio"]');
		const radiosArray = Array.from(radios);

		radios.forEach((radio, index) => {
			const existingHandler = radioHandlerMap.get(radio);
      if (existingHandler) {
        radio.removeEventListener('click', existingHandler);
      }

			const existingKey = keyHandlerMap.get(radio);
			if (existingKey) {
				radio.removeEventListener('keydown', existingKey);
			}

			radioHandlerMap.set(radio, updateSelection);
			radio.addEventListener('click', updateSelection);

			const keyHandler = (e) => {
				const key = e.key;
				let dir = 0;

				if (key === 'ArrowRight' || key === 'ArrowDown') dir = 1;
				else if (key === 'ArrowLeft' || key === 'ArrowUp') dir = -1;
				else return;

				e.preventDefault();

				// 현재 인덱스 → 다음 인덱스 계산 (순환)
				const currentIndex = radiosArray.indexOf(radio);
				const nextIndex = (currentIndex + dir + radios.length) % radios.length;
				const nextRadio = radios[nextIndex];
				
				moveKey(nextRadio);
			};
			keyHandlerMap.set(radio, keyHandler);
			radio.addEventListener('keydown', keyHandler);
			
			radio.setAttribute('tabindex', radio.getAttribute('aria-checked') === 'true' ? '0' : '-1');
		});
	})	
};
