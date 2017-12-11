const app = new Vue({
    el: '#app',
    data: {
        todos: [],
        pendingTodo: ''
    },
    computed: {
        sortedTodos () {
            return this.todos.filter(t => !t.done)
                .concat(this.todos.filter(t => t.done))
        }
    },
    methods: {
        addTodo () {
            this.todos.push({
                text: this.pendingTodo,
                done: false
            })
            this.pendingTodo = ''
        },

        markAsDone (todo) {
            todo.done = true
        },

        remove (index) {
            this.todos.splice(index, 1)
        }
    }
})