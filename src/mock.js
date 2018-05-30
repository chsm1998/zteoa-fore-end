const Mock = require('mockjs');
const Random = Mock.Random;
const produceNewsData = function () {
    let articles = [];
    for (let i = 0; i < 100; i++) {
        let newArticleObject = {
            id: Random.natural(),
            date: Random.date('yyyy-MM-dd'),
            name: Random.cname(),
            phone: Random.natural(13400000000, 14000000000),
            position : {
                name: Random.cname()
            },
            dept: {
                name: Random.cname()
            },
            address: Random.county(true)
        }
        articles.push(newArticleObject)
    }

    return articles
}

Mock.mock('/zteoa/emp/queryList', 'post', produceNewsData);