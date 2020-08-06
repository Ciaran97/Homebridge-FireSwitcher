const path_RE = /\{\$[^${]+\}/g;
var Service, Characteristic;
var Firebase = require('firebase/app');
require("firebase/database");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    
    homebridge.registerAccessory("homebridge-fireswitch", "FireSwitch", fireSwitch);
};

class fireSwitch {
    constructor(log, config) {
        var self = this;
        this.log = log;
        this.name = config.name;
        this.apiKey = config.apiKey;
        this.authDomain = config.authDomain;
        this.databaseUrl = config.databaseUrl;
        this.on_value = config.on_value;
        this.off_value = config.off_value;
        this.projectId = config.projectId;
        this.storageBucket = config.storageBucket;
        this.messagingSenderId = config.messagingSenderId;
        this.appId = config.appId;
        this.measurementId = config.measurementId;
        
        var firebaseConfig = {
            apiKey: this.apiKey,
            authDomain: this.authDomain,
            databaseURL: this.databaseUrl,
            projectId: this.projectId,
            storageBucket: this.storageBucket,
            messagingSenderId: this.messagingSenderId,
            appId: this.appId,
            measurementId: this.measurementId
        };

        Firebase.initializeApp(firebaseConfig);

        var database = firebase.database();



    

    
        getState(callback) 
        {
            var self = this;

            database.ref('GPIO_23').on('value', function(snapshot) {
                var val = snapshot.val();
                if ((self.on_value) && (self.on_value == val)) {
                    self._state = true;
                    callback(null, self._state);
                    return;
                }
                
                if ((self.off_value) && (self.off_value == val)) {
                    self._state = false;
                    callback(null, self._state);
                    return;
                }
                
                if ((self.on_value == undefined) || (self.on_value == null)) {
                    self.state = (val == undefined) || (val == null);
                    callback(null, self._state);
                    return;
                }
                
                if ((self.off_value == undefined) || (self.off_value == null)) {
                    self.state = (val != undefined) && (val != null);
                    callback(null, self._state);
                    return;
                }
            });


            callback(null, this._state);
        }
        
        setState(val, callback) 
        {
            var self = this;
            this._state = val;
            if ((val == true) && (this.on_value)) {
                database.ref('GPIO_23').set(this.on_value).then(a => {
                    callback(null, self._state);
                });

            } else if ((val == false) && (this.off_value)) {
                database.ref('GPIO_23').set(this.off_value).then(a => {
                    callback(null, self._state);
                });
            }
        }
        
        identify(callback) 
        {
            this.log("Identify requested");
            callback();
        }
        
        getServices() 
        {
            var switchService = new Service.Switch(this.name);
            
            switchService
                .getCharacteristic(Characteristic.On)
                .on('set', this.setState.bind(this));
                
            return [switchService];
        }
}
