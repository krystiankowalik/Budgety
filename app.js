var document,console;

var budgetController = (function() {
  
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        
    };
    
    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome>0){
            this.percentage = Math.round(this.value / totalIncome * 100)    ;
        }else{
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
  
    var budget={
        items:{
            expense: [],
            income: []
        },
        totals: {
            expense:0,
            income:0
        },
        balance: 0,
        percentage: -1
    }

    var calculateTotal = function(type){

        var sum=0;
        budget.items[type].forEach(function(current){
            sum += parseFloat(current.value);
        });
        budget.totals[type] = sum;
    };




    return {
        addItem: function(type, description,value){
            var newItem,id;
            
            if( description === ''){
                throw new Error('description is empty')
            }
            if(value === ''){
                throw new Error('value is empty')
            }
            if(value === 0){
                throw new Error('value is 0')
            }
            if(isNaN(value)){
                throw new Error('value is NaN')
            }
            
            if(budget.items[type].length>0){
                id = budget.items[type][budget.items[type].length-1].id+1;
            }else{
                id = 0;
            }
            
            if(type==='expense'){
                newItem = new Expense(id,description,value);
            }else if(type==='income'){
                newItem = new Income(id,description,value);
            }
            
            budget.items[type].push(newItem);
            return newItem;
            
            
        },
        
        deleteItem: function(type,id){
            var ids = budget.items[type].map(function(current){
                return current.id;
            });
            
            var index = ids.indexOf(id);
            
            if(index !== -1){
                budget.items[type].splice(index,1);
            } 
        },
        
        calculateBudget: function(){
            console.log('calculating the budget');
            
            calculateTotal('income');
            calculateTotal('expense');
            
            budget.balance = budget.totals.income - budget.totals.expense;
            
            if(budget.totals.income > 0){
                budget.percentage = Math.round( budget.totals.expense / budget.totals.income * 100);
            }else{
                budget.percentage = -1;
            }
            
        },
        
        calculatePercentages: function(){
          
            var totalIncome = budget.totals.income;
            
            if(totalIncome > 0){
                budget.items.expense.forEach(function(current){
                    current.calculatePercentage(totalIncome);
                });    
            }            
        },
        
        getPercentages: function(){
            var percentages = budget.items.expense.map(function(current){
                return current.getPercentage();
            });
            return percentages;
        },
        
        getBudgetData: function(){
            return{
                balance: budget.balance,
                totalIncome: budget.totals.income,
                totalExpense: budget.totals.expense,
                percentageSpent: budget.percentage
            }
        },
        
        testing: function(){
            console.log(budget);
        }
    }
    
})();

var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expense__list',
        balanceLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expense--value',
        percentageLabel: '.budget__expense--percentage',
        itemContainer: '.container',
        expensePercentageLabel:'.item__percentage',
        dateLabel: '.budget__title--month'
        
    }
    
    var nodeListForEach = function(list,callback){
        for (var i = 0; i <list.length; i++)  {
            callback(list[i],i);
        }
    };
    
    return{
        
        getInput: function(){
            return{
             type: document.querySelector(DOMStrings.inputType).value,
             description: document.querySelector(DOMStrings.inputDescription).value,
             value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
            
        },
    
        addListItem: function(object, type){
            var html,newHtml,element;
            if(type === 'income'){
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';    
            }else{
                element = DOMStrings.expenseContainer;
                
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', UIController.formatNumber(object.value,type));
            
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        
        deleteListItem: function(id){
            var element = document.getElementById(id)
            element.parentElement.removeChild(element);
        },
        
        clearInputFields: function(){
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current,index,array){
                current.value = '';
            })
            fieldsArray[0].focus();
        },
        
        displayBudget: function(budgetData){
            document.querySelector(DOMStrings.balanceLabel).textContent = UIController.formatNumber(budgetData.balance, budgetData.balance>0 ? 'income' : 'expense');
            document.querySelector(DOMStrings.incomeLabel).textContent = UIController.formatNumber(budgetData.totalIncome, 'income');
            document.querySelector(DOMStrings.expenseLabel).textContent = UIController.formatNumber(budgetData.totalExpense,'expense');
                        
            var percentage;
            if(budgetData.percentageSpent>0){
                percentage = budgetData.percentageSpent + '%'
            }else{
                percentage = '---'
            }
            document.querySelector(DOMStrings.percentageLabel).textContent = percentage;
            
        },
        
        displayPercentages: function(percentages){
            var percentageFields = document.querySelectorAll(DOMStrings.expensePercentageLabel);
            
         
            
            nodeListForEach(percentageFields, function(current,index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%'
                } else{
                    current.textContent = '---'
                }
            });
        },
        
        displayMonth: function(){
            var now = new Date();
            var year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = year;
        },
        
        formatNumber: function(number, type){
            
            if(number === 0){
                return '0.00';
            }
            var formattedNumber = Math.abs(number);
            formattedNumber= new Intl.NumberFormat('en-UK', {minimumFractionDigits:2,maximumFractionDigits:2 }).format(formattedNumber);
            var sign = '';
            if(type==='expense'){
                sign = '-';
            }else{
                sign = '+';
            }
            return sign + ' ' + formattedNumber;
                
                
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );
            
            nodeListForEach(fields, function(current){
               current.classList.toggle('red-focus');
            });
        },
        
        getDOMStrings: DOMStrings
    }
    
    
    
    
})();

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function(){
        document.querySelector(UICtrl.getDOMStrings.inputButton).addEventListener('click',function(){
            ctrlAddItem();
        });

        document.addEventListener('keypress', function(event){
            if(event.keyCode===13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(UICtrl.getDOMStrings.itemContainer).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(UICtrl.getDOMStrings.inputType).addEventListener('change', UICtrl.changedType)
        

    }
    
    var updateBudget = function(){

        
        budgetCtrl.calculateBudget();
        
        var budgetData = budgetCtrl.getBudgetData();
        
        console.log(budgetData);
        
        UICtrl.displayBudget(budgetData);
        
    };
    
    var updatePercentages = function(){
        budgetCtrl.calculatePercentages();
        
        console.log(budgetCtrl.getPercentages());
        
        UICtrl.displayPercentages(budgetCtrl.getPercentages());
        
    };
    
    var ctrlAddItem = function(){
        
        var input = UICtrl.getInput();
        
        newItem = budgetCtrl.addItem(input.type,input.description,input.value);
        
        UICtrl.addListItem(newItem, input.type);
        
        UICtrl.clearInputFields();
        
        updateBudget();
        
        updatePercentages();
    }
    
    var ctrlDeleteItem = function(event){
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId.startsWith('income-') || itemId.startsWith('expense-')){
            var splitId = itemId.split('-');
            var type = splitId[0];
            var numericId = parseInt(splitId[1]);
            
            budgetCtrl.deleteItem(type,numericId);
            
            UICtrl.deleteListItem(itemId);
            
            updateBudget();
        }
    };
    
    
    return {
        init: function(){
            console.log('Application has started');
            setupEventListeners();
            UICtrl.displayBudget({
                balance: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentageSpent: -1}
            );
            UICtrl.displayMonth();
        }
    }
    
    
})(budgetController,UIController);


controller.init();

