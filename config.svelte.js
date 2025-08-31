export default {
    preprocess : sveltePreprocess ({
        scss :{
            api : 'modern',
            prependData : `@use'src/scss/styles.scss' as * ;`
        }
    })
}