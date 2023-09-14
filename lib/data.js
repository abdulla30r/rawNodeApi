//dependencies
const fs = require("fs");
const path = require("path");

const lib = {};

//base directory name
lib.basedir = path.join(__dirname, "./../.data/");

//write data to file
lib.create = function (dir, file, data, callback) {
    //open file for writting
    fs.open(
        lib.basedir + dir + "/" + file + ".json",
        "wx",
        function (err, fileDescriptor) {
            if (!err && fileDescriptor) {
                //CONVERT data to string
                const stringData = JSON.stringify(data);

                //write data to file and close it

                fs.writeFile(fileDescriptor, stringData, function (err2) {
                    if (!err2) {
                        fs.close(fileDescriptor, function (error) {
                            if (!error) {
                                callback(false);
                            } else {
                                callback("Error Closing the new file");
                            }
                        });
                    } else {
                        callback("error writing to new file");
                    }
                });
            } else {
                callback(err);
            }
        }
    );
};

//read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, "utf-8", (err, data) => {
        callback(err, data);
    });
};

//update existing file
lib.update = (dir, file, data, callback) => {
    //file open
    fs.open(
        lib.basedir + dir + "/" + file + ".json",
        "r+",
        (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                //convert data to string
                const stringData = JSON.stringify(data);

                //truncate the file
                fs.ftruncate(fileDescriptor, (err2) => {
                    if (!err2) {
                        //wrtie to the file and close it
                        fs.writeFile(fileDescriptor, stringData, (err3) => {
                            if (!err) {
                                //close
                                fs.close(fileDescriptor, (err4) => {
                                    if (!err4) {
                                        callback(false);
                                    } else {
                                        callback(err);
                                    }
                                });
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        callback(err2);
                    }
                });
            } else {
                callback("error updating. File may not exist");
            }
        }
    );
};

//delete existing file
lib.delete = (dir, file, callback) => {
    //unlink
    fs.unlink(lib.basedir + dir + "/" + file + ".json", (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

module.exports = lib;
