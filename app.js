const app = new Vue({
    el: '#app',
    data: {
        todos: [],
        pendingTodo: ''
    },
    methods: {
        addTodo () {
            this.todos.push(this.pendingTodo)
            this.pendingTodo = ''
        }
    }
})