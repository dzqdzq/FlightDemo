conn = new Mongo("mongodb://admin:123456@127.0.0.1:27017/");
db = conn.getDB("flight");
printjson(db.createUser({
  user:"flight", 
  pwd:"123456",
  roles:[
    { role:"readWrite", db:"flight" }
  ]}
)
);