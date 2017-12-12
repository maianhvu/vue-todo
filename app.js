const DateTime = luxon.DateTime

const SORT_INSERTION = 'SORT_INSERTION'
const SORT_ALPHA = 'SORT_ALPHA'
const SORT_DEADLINE = 'SORT_DEADLINE'
const SORT_PRIORITY = 'SORT_PRIORITY'
const TODOS_LOCALSTORAGE_KEY = 'vueTodoApp-todos'

const API_ENDPOINT = 'https://parrotodo.herokuapp.com'

const padWithZeroes = (number, length) => {
    let result = number.toString()
    if (result.length >= length) {
        return result
    }
    let pad = ''
    while (length > result.length) {
        pad += '0';
        --length
    }
    return pad + result
}

const app = new Vue({
    el: '#app',
    data: {
        todos: JSON.parse(localStorage.getItem(TODOS_LOCALSTORAGE_KEY)||"[]").map(todo => {
            if (todo.hasOwnProperty('deadline')) {
                todo.deadline = DateTime.fromISO(todo.deadline)
            }
            return todo
        }),
        sortingOrder: SORT_INSERTION,
        pendingTodo: '',
        pendingDeadline: '',
        pendingPriority: 0,
        ifModify:0,
        modifiedText:'',
        modifiedDeadline:'',
        modifiedPriority: 0
    },
    computed: {
        sortedTodos () {
            let insertionOrder = this.todos.filter(t => !t.done)
                .concat(this.todos.filter(t => t.done))
            switch (this.sortingOrder) {
                case SORT_ALPHA:
                return insertionOrder.sort((a, b) => a.text.localeCompare(b.text))

                case SORT_PRIORITY:
                return insertionOrder.sort((a, b) => b.priority - a.priority)

                case SORT_DEADLINE:
                return insertionOrder.sort((a, b) => {
                    // Both deadlines are not present => equal
                    if (!a.hasOwnProperty('deadline') && !b.hasOwnProperty('deadline')) {
                        return 0
                    }
                    if (!a.hasOwnProperty('deadline')) return 1 // a doesn't have a deadline, comes after
                    if (!b.hasOwnProperty('deadline')) return -1 // b doesn't have a deadline, comes after
                    // Otherwise, sort by their deadlines
                    return a.deadline - b.deadline
                })

                default:
                return insertionOrder
            }
        }
    },
    methods: {
        addTodo () {
            let todo = {
                text: this.pendingTodo,
                done: false,
                priority: this.pendingPriority
            }
            if (this.pendingDeadline.trim().length &&
                /^\d{1,2}:\d{2}\s\d{1,2}\/\d{1,2}\/\d{4}$/.test(this.pendingDeadline.trim())) {

                let [ time, date ] = this.pendingDeadline.trim().split(/\s/)
                let [ hour, minute ] = time.split(':').map(n => parseInt(n))
                let [ day, month, year ] = date.split('/').map(n => parseInt(n))
                todo.deadline = DateTime.local(year, month, day, hour, minute)
            }

            // console.log(typeof(todo.deadline.toISO()),todo.deadline.toISO());
            axios.post(API_ENDPOINT + `/todos`, {
              title: this.pendingTodo,
              deadline: todo.deadline? todo.deadline.toISO():null,
              priority: this.pendingPriority
            }).then(response => {
              console.log(response.data);
              todo.id = response.data.id;
            })
            .catch(err=>console.log(err))
            // Reset
            this.todos.push(todo);
            this.pendingTodo = ''
            this.pendingDeadline = ''
            this.pendingPriority = 0
        },

        markAsDone (todo) {
            todo.done = true
        },

        remove (index) {
            let id = this.todos[index].id;
            this.todos.splice(index, 1)
            axios.delete(API_ENDPOINT + `/todos/`+id, {
            }).then(response => console.log(response.data))
            .catch(err=> {console.log(err)})
        },
        openModify(todo){
          this.ifModify = todo.id;
          axios.get(API_ENDPOINT + `/todos/` + todo.id, {
          }).then(response => {
            this.modifiedText = response.data.title;
            let deadlineStr = response.data.deadline;
            if(deadlineStr){
              let [year,month,dayStr] = deadlineStr.split('-');
              let [day,timeStr] = dayStr.split('T');
              let [hour, minute, restStr] = timeStr.split(':');
              this.modifiedDeadline = padWithZeroes(hour,2)+":"+padWithZeroes(minute,2)+' '+padWithZeroes(day,2)+'/'+padWithZeroes(month,2)+'/'+year;
            }else{
              this.modifiedDeadline = '';
            }
            this.pendingPriority = response.data.priority;
          })
          .catch(err =>{console.log(err);})
        },
        modify (todo) {
            let id = todo.id;
            if (this.modifiedDeadline.trim().length &&
                /^\d{1,2}:\d{2}\s\d{1,2}\/\d{1,2}\/\d{4}$/.test(this.pendingDeadline.trim())) {
                let [ time, date ] = this.pendingDeadline.trim().split(/\s/)
                let [ hour, minute ] = time.split(':').map(n => parseInt(n))
                let [ day, month, year ] = date.split('/').map(n => parseInt(n))
                todo.deadline = DateTime.local(year, month, day, hour, minute)
            }
            todo.priority = this.modifiedPriority;
            todo.text = this.modifiedText;
            axios.patch(API_ENDPOINT + `/todos/`+id, {
              title:this.modifiedText,
              deadline:todo.deadline? todo.deadline.toISO():null,
              priority:this.modifiedPriority>0? this.modifiedPriority:this.pendingPriority
            }).then(response => console.log(this.pendingPriority,this.modifiedPriority,response.data))
            .catch(err=>console.log(err))
        },

        formatDate (date) {
            return date.toLocaleString(DateTime.DATETIME_FULL)
        }

    },

    mounted () {
        axios.get(API_ENDPOINT + '/todos').then(response => {
            this.todos = response.data.map(todo => ({
                text: todo.title,
                priority: todo.priority,
                deadline: todo.deadline ? DateTime.fromISO(todo.deadline) : undefined,
                id: todo.id
            }))
        }).catch(err => {
            console.error(err)
        })
    }
})
