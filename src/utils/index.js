import store from "@/store"


export default {
    tokenHeaderName: 'Authorization',
    tokenType: 'Bearer ',

    //获取保存在本地的Token
    getToken() {
        let token = store.state.token;
        if (!token) {
            token = window.localStorage.getItem("token");
            if (token) {
                store.commit('setToken', token);
            }
        }
        return token;
    },

    //把多行文本转化成列表，一行一个列表项
    textToList(text){
        let begin = 0;
        let list = [];
        for(let i=0;i<text.length;i++){
            if(text.charAt(i)==='\n'){
                list.push(text.substring(begin, i+1));
                begin=i+1;
            }
        }
        list.push(text.substring(begin, text.length));
        return list;
    }
}