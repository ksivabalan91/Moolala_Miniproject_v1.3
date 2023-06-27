//! this is forward all calls to localhost:8080
module.exports  = [
    {
        context: ['/**'],
        target: 'http://localhost:8080',
        secure: false
    }
]