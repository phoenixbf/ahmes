/*
	Main js entry for template ATON web-app

===============================================*/
// Realize our app
let APP = ATON.App.realize();

APP.PATH_DB = APP.basePath + "data/main.json";

APP._currItem = undefined;
APP._currCat  = undefined;
APP._db       = undefined;


// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

	// Realize base ATON and add base UI events
    ATON.realize();
    ATON.UI.addBasicEvents();

    ATON.SUI.setSelectorRadius(0.01);

	APP.gItem = ATON.createSceneNode("item");
	APP.gItem.attachToRoot();

	APP.setupEventHandling();
    APP.setupUI();

    APP.getStorage("main").then( APP.onDBLoaded ).catch( (err)=>{ console.log(err) } );
};


APP.setupEventHandling = ()=>{
    // If our app required ore or more flares (plugins), we can also wait for them to be ready for specific setups
    ATON.on("AllFlaresReady",()=>{
		// Do stuff
		console.log("All flares ready");
	});

	ATON.on("AllNodeRequestsCompleted",()=>{
		//
	});
};

APP.realizeDB = ()=>{
    //TODO
};

APP.loadItem = (item)=>{
    if (!APP._db) return;

    for (let cat in APP._db){
        const C = APP._db[cat];

        for (let i in C){
            if (i===item){
                const I = C[i];

                APP._currItem = i;
                APP._currCat  = cat;

                APP.gItem.load( I.models[0] );
            }
        }
    }
};

APP.onDBLoaded = (data)=>{
    console.log(data);

    APP._db = data;

	let item = APP.params.get("i");
	if (item){
        APP.loadItem(item);
	}
    else {
        ATON.UI.showModal({
            header: "AHMES tool",
            body: ATON.UI.createContainer({items: [
                ATON.UI.createElementFromHTMLString(`
                    <p>
                    ...
                    </p>`
                ),
/*
                ATON.UI.createDropdown({
                    title: "Pick a 3D model",
                    btnclasses: "btn-default",
                    classes: "d-grid gap-2 dropup dropup-center",
                    items:[
                        {
                            title: "Mammouth",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS1-mammuth/mammuth_cs1.gltf",
                        },
                    ]
                })
*/
            ]})
        });
    }
};

/* 
    UI
=============================*/
APP.setupUI = ()=>{
    ATON.UI.get("toolbar").append(
        ATON.UI.createButtonHome(),
    );
};

APP.modalEditCurrentItem = ()=>{
    let elBody = ATON.UI.createContainer();


    ATON.UI.showModal({
        header: "Edit "+APP._currItem,
        body: elBody
    });
};

/* If you plan to use an update routine (executed continuously), you can place its logic here.
APP.update = ()=>{

};
*/
