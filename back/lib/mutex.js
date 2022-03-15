class Mutex {
    constructor(){
        this.lock = false;
    }

    async acquire(){
        while(true){
            if(this.lock===false){
                break;
            }
            await setTimeout(function () {},100)
        }
        this.lock = true;
    }

    release(){
        this.lock = false;
    }
}

const mutex = new Mutex();
exports.mutex = mutex;