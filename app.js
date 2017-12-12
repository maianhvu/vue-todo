const DateTime = luxon.DateTime

const SORT_INSERTION = 'SORT_INSERTION'
const SORT_ALPHA = 'SORT_ALPHA'
const SORT_DEADLINE = 'SORT_DEADLINE'
const SORT_PRIORITY = 'SORT_PRIORITY'
const TODOS_LOCALSTORAGE_KEY = 'vueTodoApp-todos'

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
        pendingPriority: 0
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

            this.todos.push(todo)

            // Reset
            this.pendingTodo = ''
            this.pendingDeadline = ''
            this.pendingPriority = 0
        },

        markAsDone (todo) {
            todo.done = true
        },

        remove (index) {
            this.todos.splice(index, 1)
        },

        formatDate (date) {
            return date.toLocaleString(DateTime.DATETIME_FULL)
        }

    },

    watch: {

        todos (newTodos) {
            localStorage.setItem(TODOS_LOCALSTORAGE_KEY, JSON.stringify(newTodos))
        }
    }
})
