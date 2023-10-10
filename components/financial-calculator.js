class FinancialCalc extends HTMLElement {
constructor() {
  super();

  this.formCredit = document.createElement('form');
  this.formCredit.name = 'credit_calc_data';

  this.creditSumInput = document.createElement('input');
  this.creditSumInput.name = 'credit_sum';
  this.creditSumInput.type = 'text';
  this.creditSumInput.value = '1 000'
  
  this.creditSumLabel = document.createElement('label');
  this.creditSumLabel.innerText = 'Сумма кредита';


  this.creditTermInput = document.createElement('input');
  this.creditTermInput.type = 'number'
  this.creditTermInput.min = 1;
  this.creditTermInput.value = 12;
  this.creditTermInput.max = 999;


  this.creditTermLabel = document.createElement('label');
  this.creditTermLabel.innerText = "Срок кредита, месяцев";


  this.creditInterestInput = document.createElement('input');
  this.creditInterestInput.type = 'text';
  this.creditInterestInput.value = '1';

  this.creditSumInput.addEventListener('input', () => this.handleInput(this.creditSumInput, 1000));
  this.creditSumInput.addEventListener('blur', () => this.handleBlur(this.creditSumInput, 1000));
  this.creditTermInput.addEventListener('input', () => this.handleInput(this.creditTermInput, 1, true));
  this.creditTermInput.addEventListener('blur', ()=> this.handleBlur(this.creditTermInput, 1))
  this.creditInterestInput.addEventListener('input', () => this.handleInput(this.creditInterestInput, 0.1));
  this.creditInterestInput.addEventListener('blur', ()=> this.handleBlur(this.creditInterestInput, 0.1))
  
  this.creditInterestLabel = document.createElement('label')
  this.creditInterestLabel.innerText = "Ставка по кредиту, %% годовых"
  
  this.monthlyPaymentField = document.createElement('h3')
  this.totalPaymentField = document.createElement('h3')
  this.totalInterestField = document.createElement('h3')
  
  this.wrapper = document.createElement('section')
  this.wrapper.className = 'wrapper'

  // this.calculateCredit();
  this.linkCSS = document.createElement('link')
  this.linkCSS.rel = 'stylesheet'
  this.linkCSS.href = './components/financial-calculator.css'
 
}
  handleBlur(input, minValue) {

    if (input.value.includes(',')) {
      while (input.value.endsWith('0')){
        input.value = input.value.slice(0, -1)
      }
    }
    if (input.value.endsWith(',')) {
      input.value = input.value.slice(0, -1)
    }
    if (+input.value.replace(', ', '.').replaceAll(' ', '') < minValue) {
      input.value = this.formatNumber(minValue) + ''
      this.calculateCredit()
    }
  }

  removeGarbage(str) {
    return str.split('').filter(elem => '0123456789,'.indexOf(elem) != -1).join('')
  }
  
  handleInput(input, minValue, isInteger = false) {

    if (input.value == ',' || input.value == '.') {
      input.value = '0,'
    }

    if (!input.value || input.value == '0') return
    if (input.value == '0,' || input.value == '0.') {
      input.value == input.value.replace(',', '.')
      return
    }
    
    
    // Убираем пробелы из значения поля ввода, т.к. отображаем в полях ввода числа с разделителями разрядов
    let val = this.removeGarbage(input.value).replace(',', '.').replaceAll(',', '')
   
    /* Убираем последний введенный нечисловой символ либо пытаемся докопаться до числа,
     если в поле ввода будет скопировано значение, а не введено с клавиатуры, в худшем случае получаем '' */

    if (isNaN(val)) {
      val = this.removeGarbage(val) || minValue+''
    }
    
    if (!isNaN(val)) {  
      if(input.max && +val > input.max) {
        val = input.max + ''
      }
      if (isInteger) {
        val = Math.ceil(+val) + '';
      }

      if (val.indexOf('.') != - 1 &&  +val.slice(0, -1) == +val) {
        input.value = this.formatNumber(+val) + val.slice(val.indexOf('.')).replace('.', ',')
        return
      }

      if (+val == 0) {
        val = this.formatNumber(minValue) + ''
      } else if (+val < 0) {
        val = (Math.abs(+val) + '')
      }
      input.value = this.formatNumber(+val) + ''
      this.calculateCredit();
    }
  }

  formatNumber(num, sep = ' '){
    let intPart = String(Math.floor(num));
    let floatPart = String(num)
    if (floatPart.includes('.')) {
      floatPart = `,${floatPart.slice(floatPart.indexOf('.') + 1)}`
    } else {
      floatPart = '';
    }
    let segmTotal = Math.ceil(intPart.length / 3)
    let firstSegm = intPart.length % 3;
    let result = firstSegm > 0 ? `${intPart.slice(0, firstSegm)}${sep}`:'';
  
    for (let i = 1; i <= segmTotal; i++) {
      result +=`${intPart.slice(firstSegm + 3 * (i - 1), firstSegm + i * 3)}${sep}`;
    }
    result = `${result.trim()}${floatPart}`;
    return result;
  }


  calculateCredit(){
    this.creditInterest = +this.creditInterestInput.value.trim().replace(',','.').replaceAll(' ', '') / 100

    this.creditTerm = +this.creditTermInput.value.replace(',', '.').replaceAll(' ', '');
    this.creditSum = +this.creditSumInput.value.replace(',', '.').replaceAll(' ', '');
    this.monthlyPayment = (this.creditSum * this.creditInterest / 12 * ((1 + this.creditInterest / 12) ** this.creditTerm) / (((1 + this.creditInterest/12) ** this.creditTerm)- 1)).toFixed(2)
    this.totalSum = (this.monthlyPayment * this.creditTerm).toFixed(2);
    this.totalInterest = (this.totalSum - this.creditSum).toFixed(2);
    this.monthlyPaymentField.innerHTML = `Ежемесячный платеж: <strong class="number_display">${this.formatNumber(this.monthlyPayment, ' ', 2)}</strong>`
    this.totalPaymentField.innerHTML = `Сумма всех платежей: <strong class="number_display">${this.formatNumber(this.totalSum)}</strong>`
    this.totalInterestField.innerHTML = `Сумма процентных платежей: <strong class="number_display">${this.formatNumber(this.totalInterest)}</strong>`
    console.log('Данные обновлены')
  }
  connectedCallback() {
    this.creditSumLabel.append(this.creditSumInput);
    this.creditTermLabel.append(this.creditTermInput);
    this.creditInterestLabel.append(this.creditInterestInput);
    this.formCredit.append(this.linkCSS, this.creditSumLabel, this.creditInterestLabel, this.creditTermLabel);
    this.wrapper.append(this.formCredit, this.monthlyPaymentField, this.totalPaymentField, this.totalInterestField)
    const shadow = this.attachShadow({mode: 'open'});
    shadow.append(this.wrapper);
    console.log('Кредитный калькулятор создан');
    this.calculateCredit();
  }
  disconectedCallback() {
    console.log('Кредитный калькулятор удален из документа')
  }
}

customElements.define('financial-calculator', FinancialCalc);