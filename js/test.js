document.addEventListener('DOMContentLoaded', () => {
    // Селекторы для элементов
    const passwordField = document.getElementById("passwd");
    const checkboxes = {
      digits: document.getElementById("digits"),
      symbols: document.getElementById("symbols"),
      capital: document.getElementById("capital"),
      patterns: document.getElementById("patterns"),
      databases: document.getElementById("databases"),
    };
    
    // Шаблоны запрещённых паролей
    // const forbiddenPatterns = /(1234|abcd|qwerty|root|admin|password|test|letmein|welcome|abc123|123456|password1)/i;
    const forbiddenPatterns = (passwd) => {
      var score         = PasswordStrengthChecker.getPasswordStrength(passwd);
      var scoreold = PasswordStrengthCheckerOld.getPasswordStrength(passwd);
      const hasPattern = (score.quality > 1 && scoreold.reasons[0] === 1) || passwd.length <  10; 
      return !hasPattern;
    };
    
    
    // Функция проверки пароля
    const checkPassword = (password) => {
      // Условия
      const containsDigits = /\d/.test(password);
      const containsSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const containsCapital = /[A-Z]/.test(password);
      const noPatterns = forbiddenPatterns(password); 
      const notInDatabases = password.length >= 8; // Заглушка для проверки баз данных (реализация зависит от API)
    
      // Обновление состояния чекбоксов
      checkboxes.digits.checked = containsDigits;
      checkboxes.symbols.checked = containsSymbols;
      checkboxes.capital.checked = containsCapital;
      checkboxes.patterns.checked = noPatterns;
      // checkboxes.databases.checked = notInDatabases;
    };
    
    
    
    const copyField = document.querySelector(".copy-field");
    const clearField = document.querySelector(".clear-field");
    const statusLink = document.querySelectorAll(".status__link");
    const progressBar = document.querySelector(".progress-bar");
    const themeToggleBtn = document.querySelector(".dark-mode__toggle > input");
    
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("change", () => {
        lightThemeStylesFaq();
      })
    }
    
    if (passwordField) {
      // Добавление слушателя событий для поля пароля
      passwordField.addEventListener("input", (event) => {
        clearField.style.display = 'block';
        let isCompromised;
        const password = event.target.value;
        checkPassword(password);
        isCompromised = isPasswordPwned(password);
        if(passwordField === '') {
          copyField.style.display = 'none';
        }
      });
    }
    
    if (copyField && clearField) {
      copyField.style.display = 'none';
      clearField.style.display = 'none';
    
      let timeoutIdHidePopap;
      let timeoutIdRemovePopap;
    
      // Копирование пароля
      copyField.addEventListener("click", () => {
        if (passwordField.value) {
          navigator.clipboard
            .writeText(passwordField.value)
            .then(() => {
              // Создаем тег span
              const span = document.createElement("span");
              span.textContent = "Password copied";
              span.classList.add("copy-field__popap");
    
              const existingSpan = copyField.querySelector("span");
              if (existingSpan) {
                clearTimeout(timeoutIdHidePopap);
                clearTimeout(timeoutIdRemovePopap);
                copyField.querySelector("span").remove();
              }
    
              // Добавляем span в copyField
              copyField.appendChild(span);
    
    
              // Убираем span через 3 секунды
              timeoutIdHidePopap = setTimeout(() => {
                span.style.opacity = "0"; // Плавное скрытие
                span.classList.add("hide");
                timeoutIdRemovePopap = setTimeout(() => {
                  span.remove(); // Удаление после скрытия
                }, 300); // Учитываем transition
              }, 3000);
            })
            .catch((err) => {
              console.error("Failed to copy password: ", err);
            });
        } else {
          alert("Password field is empty!");
        }
      });
    
      // Очистка пароля
      clearField.addEventListener("click", () => {
        clearPasswordField();
        copyField.style.display = 'none';
        clearField.style.display = 'none';
      });
    }
    
    
    statusLink.forEach(elem => {
      if(elem) {
        elem.addEventListener("click", () => {
          handleGeneratePassword();
        });
      }
    })
    
    
    const clearPasswordField = () => {
      // passwordField.focus();
      passwordField.value = "";
      passwordField.dispatchEvent(new Event("input")); // Вызывает событие для обновления состояния чекбоксов
    };
    
    const fieldLabel = document.querySelector(".field__label");
    
    // Функция для обновления класса
    const updateLabelClass = () => {
      if (passwordField.value || document.activeElement === passwordField) {
        fieldLabel.classList.add("out-line");
        document.querySelector(".form__rules").classList.add("show-checkbox");
      } else {
        fieldLabel.classList.remove("out-line");
        document.querySelector(".form__rules").classList.remove("show-checkbox");
      }
    };
    
    // Обработчики событий
    if (passwordField) {
      passwordField.addEventListener("focus", updateLabelClass);
      passwordField.addEventListener("blur", updateLabelClass);
      passwordField.addEventListener("input", updateLabelClass);
    }
    
    
    // Обновляем при загрузке страницы
    if (passwordField) {
      window.addEventListener("DOMContentLoaded", updateLabelClass);
    }
    
    const rulesContainer = document.querySelector(".rules");
    const checkboxesRules = document.querySelectorAll(".rules__checkbox-input");
    
    
    
    // Проверки пароля
    const passwordChecks = {
      digits: (password) => /\d/.test(password),
      symbols: (password) => /[!@#;/$%^&*№+(),.?":{}|=\-<>_]/.test(password),
      capital: (password) => /[\p{Lu}ÈÉËÊÛÜÙÚÎÌÏĪÍÖÔÓÒØÆÃÅÀÁÄÇ]/u.test(password),
      patterns: (password) => forbiddenPatterns(password), // Расширенный список запрещённых шаблонов
      databases: async (password) => {
        const result = await isPasswordPwned(password);
        return !result;
      },
    };
    
    const updateRulesState = async () => {
      const password = passwordField.value;
    
      let matches = 0;
    
      const checkPromises = Object.keys(passwordChecks).map(async (key) => {
        const checkPassed = await passwordChecks[key](password);
        const checkbox = document.getElementById(key);
    
        if (checkbox) {
          checkbox.checked = checkPassed;
          if (checkPassed) matches++;
        }
      });
    
      await Promise.all(checkPromises);
    
      const fieldWrapper = document.querySelector(".form__input .field");
      const rulesStatus = document.querySelector(".rules__status");
      // Удаляем предыдущие классы
      rulesContainer.classList.remove("is-overdue", "is-change", "is-secure");
      fieldWrapper.classList.remove("is-overdue", "is-change", "is-secure");
      rulesStatus.classList.remove("is-overdue", "is-change", "is-secure");
      // Задаем класс в зависимости от количества совпадений
      if (matches === 5 && passwordField.value.length >= 16) {
        rulesContainer.classList.add("is-secure");
        rulesStatus.classList.add("is-secure");
        fieldWrapper.classList.add("is-secure");
      } else if (matches >= 3) {
        rulesContainer.classList.add("is-change");
        rulesStatus.classList.add("is-change");
        fieldWrapper.classList.add("is-change");
      } else if (matches < 3 && matches >= 0 && passwordField.value.trim() !== "") {
        rulesContainer.classList.add("is-overdue");
        rulesStatus.classList.add("is-overdue");
        fieldWrapper.classList.add("is-overdue");
      }
    };
    
    // Событие для проверки пароля при вводе
    if (passwordField) {
      passwordField.addEventListener("input", updateRulesState);
    }
    
    // Инициализация при загрузке страницы
    if (passwordField) {
      window.addEventListener("DOMContentLoaded", updateRulesState);
    }
    
    // Utility to generate a random password
    function generatePassword() {
      const length = Math.floor(Math.random() * (20 - 16 + 1)) + 16; // Случайное число от 15 до 20
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
      let password = "";
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      fieldLabel.classList.add("out-line");
      return password;
    }
    
    // Function to check if the password is compromised
    async function isPasswordPwned(password) {
      const hash = await crypto.subtle.digest(
        "SHA-1",
        new TextEncoder().encode(password)
      );
      const hashHex = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);
    
      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );
      const result = await response.text();
    
      return result.includes(suffix);
    }
    
    // Event handler to generate and validate a password
    async function handleGeneratePassword() {
      let password;
      let isCompromised;
      do {
        password = generatePassword();
        
        if (
          !/\d/.test(password) ||
          !/[!@#$%^&*(),.?":{}|=\-<>_]/.test(password) ||
          !/[A-Z]/.test(password)
        ) {
          handleGeneratePassword();
          return;
        }
    
        isCompromised = await isPasswordPwned(password);
      } while (isCompromised);
    
      passwordField.type = "text"; // Показываем пароль в виде точек
      $(".eye-show").removeClass("eye-show").addClass("eye-hide");
    
      document.getElementById("passwd").value = password;
      copyField.style.display = 'block';
      clearField.style.display = 'block';
      setCopyButtonToInput();
      updateRulesState();
    }
    
    
    
    // Attach event listeners
    const generatePassBtn = document.querySelector(".field__label > span");
    const generateFormBtn = document.querySelector(".form__button-generate");
    
    if (generatePassBtn) {
      generatePassBtn.addEventListener("click", handleGeneratePassword);
    }
    if (generateFormBtn) {
      generateFormBtn.addEventListener("click", handleGeneratePassword);
    }
    
    // Получение ширины введённого текста
    function getTextWidth(font, text) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = font;
      return context.measureText(text).width;
    }
    
    function setCopyButtonToInput() {
      const fieldWrapper = document.querySelector(".form__input .field");
      const fieldInput = document.querySelector(".form__input .field__input");
      const widthField = fieldInput.offsetWidth;
      const generatePassBtns = document.querySelectorAll(".field__label span");
      copyField.style.position = "absolute";
      copyField.style.top = `${passwordField.offsetTop + 6}px`; // Выравниваем по input
    
      function updateCopyFieldPosition() {
        const font = getComputedStyle(passwordField).font;
        const text = passwordField.type === "password" ? "•".repeat(passwordField.value.length) : passwordField.value;
        const textWidth = getTextWidth(font, text); // Ширина текста + 15px
        const copyField = document.querySelector(".copy-field");
        copyField.style.top = `${passwordField.offsetTop + 1}px`; // Выравниваем по input
        const finalOffset = textWidth > widthField ? widthField : textWidth;
    
        copyField.style.left = `${finalOffset + 25}px`; // Ставим copyField в конец текста
        const password = passwordField.value;
        if(password === '') {
          copyField.style.display = 'none';
          return;
        }
        
        if (copyField.parentElement !== fieldWrapper.parentElement) {
          fieldWrapper.appendChild(copyField); // Переносим copyField за fieldWrapper
        }
      }
      updateCopyFieldPosition()
    
      // Следим за изменением типа инпута
      const observer = new MutationObserver(() => {
        updateCopyFieldPosition(); // Обновляем позицию при смене типа
      });
    
      observer.observe(passwordField, { attributes: true, attributeFilter: ["type"] });
    
      generatePassBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          if (copyField.parentElement !== fieldWrapper.parentElement) {
            fieldWrapper.appendChild(copyField); // Переносим copyField за fieldWrapper
          }
          
        });
      });
    
      passwordField.addEventListener("input", () => {
        updateCopyFieldPosition();
        copyField.style.display = 'none';
      }); // Двигаем copyField при вводе
    }
    
    // Запускаем функцию, если поле пароля и кнопка копирования существуют
    if (document.getElementById("passwd") && document.querySelector(".copy-field")) {
      setCopyButtonToInput();
    }
    
    
    
    
    // // SWIPER - переключение слайдеров по нажатию на точки
    // function swiperDotsClickHandler() {
    //   const paginationBullets = document.querySelectorAll(".swiper-pagination-bullet");
    //   const swiperContainer = document.querySelector(".swiper");
    
    //   if (swiperContainer && swiperContainer.swiper) {
    //     const swiperInstance = swiperContainer.swiper;
    
    //     swiperInstance.params.loop = true;
    //     swiperInstance.update();
    
    //     swiperInstance.on("slideChange", function() {
    //       // const realIndex = this.realIndex;
    //       // this.pagination.renderBullet(realIndex, "swiper-pagination-bullet");
    //       // this.pagination.update();
    //     })
    
    //     if (paginationBullets) {
    //       paginationBullets.forEach((dot, index) => {
    //         dot.addEventListener("click", () => {
    //           swiperInstance.slideTo(index);
    //         })
    //       })
    //     }
    //   }
    // }
    
    // swiperDotsClickHandler();
    
    
    // Стили FAQ в зависимости от выбранной темы
    function lightThemeStylesFaq() {
      const headerLink = document.querySelector(".header__link");
      const faqItems = document.querySelectorAll(".faq__item");
      const themeColor = localStorage.getItem("theme");
    
      /* На странице FAQ */
      if (headerLink && window.location.pathname === "/faq/") {
        headerLink.classList.add("open");
      }
    
      if (faqItems && themeColor === "light") {
        faqItems.forEach(element => {
          element.classList.remove("faq__item_dark");
          element.classList.add("faq__item_light");
        })
      } else if (faqItems && themeColor === "dark") {
        faqItems.forEach(element => {
          element.classList.remove("faq__item_light");
          element.classList.add("faq__item_dark");
        })
      }
    
      /* На Главной странице */
      if (progressBar && themeColor === "light") {
        progressBar.classList.remove('opacity-bar')
      } else if (progressBar && themeColor === "dark") {
        progressBar.classList.add('opacity-bar');
      }
    
    }
    lightThemeStylesFaq();
    
    function mediaQuerys() {
      const mediaQuery360 = window.matchMedia("(max-width: 360px)");
      const mediaQuery1279 = window.matchMedia("(max-width: 1279px)");
      const rules = document.querySelector(".rules");
      const rulesStatus = document.querySelector(".rules__status");
      const formRules = document.querySelector(".form__rules");
    
      if (mediaQuery1279.matches) {
        if (rules && rulesStatus) {
          rules.appendChild(rulesStatus);
          // formRules.style.minHeight = '210px';
          formRules.style.borderRadius = '8px';
          formRules.style.height = 'fit-content';
    
          if (mediaQuery360.matches) {
              rules.appendChild(rulesStatus);
              formRules.style.height = '330px';
              formRules.style.borderRadius = '16px';
          }
        }
      }
    
    }
    mediaQuerys();
    
    let sizeTimeout;
    function onResize() {
      setCopyButtonToInput();
      clearTimeout(sizeTimeout);
      sizeTimeout = setTimeout(() => {
        mediaQuerys();
      }, 200);
    }
    
    window.addEventListener("resize", onResize);
    
    })
    