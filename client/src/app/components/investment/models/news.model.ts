export class News {

    constructor(
        public publishedDate: Date,
        public title: string,
        public description: string,
        public source: string,
        public url: string,
    ) { }
}