function MyDebounce(fn) {
    let timeout = null
    return function () {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
            fn.call(this, arguments)

        }, 1000)

    }

}