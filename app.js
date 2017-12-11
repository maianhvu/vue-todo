const DateTime = luxon.DateTime

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
        todos: [],
        pendingTodo: '',
        pendingDeadline: '',
        pendingPriority: 0
    },
    computed: {
        sortedTodos () {
            return this.todos.filter(t => !t.done)
                .concat(this.todos.filter(t => t.done))
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
                
                let dateString = year + '-' + padWithZeroes(month, 2) +
                    '-' + padWithZeroes(day, 2) + 'T' + padWithZeroes(hour, 2) + ':' +
                    padWithZeroes(minute, 2)
                todo.deadline = DateTime.local(year, month, day, hour, minute)
            }

            this.todos.push(todo)
            this.pendingTodo = ''
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

    }
})