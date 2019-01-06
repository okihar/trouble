var express = require('express');
var app = express();
var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
var discovery = new DiscoveryV1({
    version: '2018-08-01',
    username: '',
    password: '',
    url: 'https://gateway.watsonplatform.net/discovery/api/',
  });
var iconv = require("iconv-lite");
var fs = require('fs');
var csv = require('csvtojson');
var Promise = require('promise');

var writeFile=function(csvFile){
    //console.log(csvFile)
    var buf = iconv.encode( csvFile , "SHIFT-JIS" );
    fs.writeFileSync('./uploads/result.csv',buf);
};
var askReqDiscovery =  function(obj){
    return new Promise(function(resolve,reject){
        discovery.query({environment_id: '', 
                         collection_id: '', 
                        query:obj.reqQuery,
                        count:100
                        },
            function(error, data) {
                /*
                if(error){
                    console.log("error:要求が長すぎます。(ask)")
                    var score = "-";
                    var rank ="-";
                    var result = {};
                    result={"score":score,"rank":rank};
                    resolve(result);
                };
                */
                if ( data ) {
                    var relativeScore;
                    var rank=0;
                    var result={};
                    for(l=0;l<data.results.length;l++){
                        if(data.results[l].title==obj.funcID){
                            relativeScore=data.results[l].result_metadata.score/data.results[0].result_metadata.score;
                            rank = l+1;
                            result={"score":relativeScore,"rank":rank};
                            resolve(result);
                        };
                    };
                };
            });
    });
};
var askFuncDiscovery =  function(obj){
    return new Promise(function(resolve,reject){
        var score = 0;
        discovery.query({environment_id: '', 
                         collection_id: '', 
                        query:obj.funcQuery,
                        count:100
                        },
            function(error, data) {
                /*
                if(error){
                    console.log("error:仕様が長すぎます。(ask)")
                    var score = "-";
                    var rank = "-";
                    var result={};
                    result={"score":score,"rank":rank};
                    resolve(result);
                };
                */
                if ( data ) {
                    var relativeScore;
                    var rank=0;
                    var result={};
                    for(l=0;l<data.results.length;l++){
                        if(data.results[l].title==obj.reqID){
                            relativeScore=data.results[l].result_metadata.score/data.results[0].result_metadata.score;
                            rank = l+1;
                            result={"score":relativeScore,"rank":rank};
                            resolve(result);
                        };
                    };
                };
            });
    });
};
//要求→要求コレクション(要求の中に含まれる専門用語（エンティティ）を洗い出す)
var analizeRequire = function(Obj){
    return new Promise(function(resolve,reject){
        discovery.query({ 
            environment_id: '', 
            collection_id: '',
            query:Obj.reqQuery,count:100
        },
        function(error, data){
            /*
            if(error){
                console.log("error:要求が長すぎます。（analize）")
                var returnObj={"wordNum":"-","entities":"-"};
                resolve(returnObj);
            };
            */
            if ( data ) {
                var entities=[];
                var returnObj={};
                var checker = 1;
                var counter = 0;
                for(j=0;j<data.results.length;j++){
                    if(data.results[j].title == Obj.reqID){
                        for(k=0;k<data.results[j].enriched_text.entities.length;k++){
                            if(k==0){
                                entities[counter] = data.results[j].enriched_text.entities[k].text;
                                counter += 1;
                            }else{
                                for(l=0;l<k;l++){
                                    //console.log("K="+k+","+data.results[j].enriched_text.entities[k].text);
                                    //console.log("l="+l+","+data.results[j].enriched_text.entities[l].text);
                                    if(data.results[j].enriched_text.entities[l].text == data.results[j].enriched_text.entities[k].text){
                                        checker = 0;
                                    };
                                };
                                if(checker==1){
                                    entities[counter] = data.results[j].enriched_text.entities[k].text;
                                    counter += 1;
                                };
                            };
                        };
                    returnObj={"wordNum":data.results[j].enriched_text.entities.length,"entities":entities};
                    //console.log(returnObj);
                    resolve(returnObj);
                    };                  
                };
            };
        });
    });
};
//仕様→仕様コレクション(仕様の中に含まれる専門用語（エンティティ）を洗い出す)
var analizeFunction = function(Obj){
    return new Promise(function(resolve,reject){
        discovery.query({ 
            environment_id: '', 
            collection_id: '',
            query:Obj.funcQuery,count:100
        },
        function(error, data){
            /*
            if(error){
                console.log("error:仕様が長すぎます。（analize）")
                var returnObj={"wordNum":"-","entities":"-"};
                resolve(returnObj);
            };
            */
            if ( data ) {
                var entities=[];
                var returnObj={};
                var checker = 1;
                var counter = 0;あああああ
                for(j=0;j<data.results.length;j++){
                    if(data.results[j].title == Obj.funcID){
                        for(k=0;k<data.results[j].enriched_text.entities.length;k++){
                            if(k==0){
                                entities[counter] = data.results[j].enriched_text.entities[k].text;
                                counter += 1;
                            }else{
                                for(l=0;l<k;l++){
                                    //console.log("K="+k+","+data.results[j].enriched_text.entities[k].text);
                                    //console.log("l="+l+","+data.results[j].enriched_text.entities[l].text);
                                    if(data.results[j].enriched_text.entities[l].text == data.results[j].enriched_text.entities[k].text){
                                        checker = 0;
                                    };
                                };
                                if(checker==1){
                                    entities[counter] = data.results[j].enriched_text.entities[k].text;
                                    counter += 1;
                                };
                            };
                        };
                    returnObj={"wordNum":data.results[j].enriched_text.entities.length,"entities":entities};
                    //console.log(returnObj);
                    resolve(returnObj);
                    };                  
                };
            };
        });
    });
};
exports.aaa = async function(req,res){
    var csvFile = "要求,専門用語数（要求）,仕様,専門用語数（仕様）,相対スコア(要求→仕様),専門用語含有率(要求→仕様),順位(要求→仕様),相対スコア(仕様→要求),専門用語含有率(仕様→要求),順位(仕様→要求),判定\n" 
    var Obj=await csv().fromFile('./checked-data/list.csv');
    var results0=[]; //要求
    var results1=[]; //専門用語数（要求）
    var results2=[]; //仕様
    var results3=[]; //専門用語数（仕様）
    var results4=[]; //相対スコア(要求→仕様)
    var results5=[]; //相対スコア(仕様→要求)
    var results6=[]; //専門用語含有率(要求→仕様)
    var results7=[]; //専門用語含有率(仕様→要求)
    var results8=[]; //順位(要求→仕様)
    var results9=[]; //順位(仕様→要求)
    var results10=[]; //判定
    var checker = [];
    var reqEntities=[];
    var funcEntities=[];

    for(i=0;i<Obj.length;i++){
        results0[i]=Obj[i].reqQuery;
        results2[i]=Obj[i].funcQuery;
    };
    var times;
    var amari;
    amari = Obj.length % 10;
    times = (Obj.length - amari)/10;
    
    for(x=0;x<times;x++){
    //要求と仕様の専門用語（エンティティ）を洗い出し、相対スコア、ランクを求める
        for(i=10*x;i<10*(x+1);i++){//本番は10→Obj.length
            console.log(i);
            var reqResult;
            var funcResult;
            var reqScoreRank;
            var funcScoreRank;

            if(Obj[i].reqQuery.length<=291){
                console.log(i+"個目の要求を分析しています");
                reqResult = await analizeRequire(Obj[i]);
                console.log(i+"個目の要求をWatsonに投げかけています");       
                reqScoreRank = await askReqDiscovery(Obj[i]);
                results4[i] = reqScoreRank.score;
                results1[i] = reqResult.wordNum;
                results8[i] = reqScoreRank.rank;
                reqEntities[i] = reqResult.entities;
            }else{
                console.log(i+"の要求が長すぎます");
                results4[i] = "-";
                results1[i] = "-";
                results8[i] = "-";
                checker[i] = 0;
            };

            if(Obj[i].funcQuery.length<=291){
                console.log(i+"個目の仕様を分析しています");
                funcScoreRank = await askFuncDiscovery(Obj[i]);
                console.log(i+"個目の仕様をWatsonに投げかけています");
                funcResult = await analizeFunction(Obj[i]);
                results5[i] = funcScoreRank.score;
                results3[i] = funcResult.wordNum;
                results9[i] = funcScoreRank.rank;
                funcEntities[i] = funcResult.entities;
            }else{
                console.log(i+"の仕様が長すぎます");
                results5[i] = "-";
                results3[i] = "-";
                results9[i] = "-";
                checker[i] = 0;
            };
        };
    };

    //要求と仕様の専門用語（エンティティ）を洗い出し、相対スコア、ランクを求める
    for(i=10*times;i<10*times+amari;i++){//本番は10→Obj.length
        console.log(i);
        var reqResult;
        var funcResult;
        var reqScoreRank;
        var funcScoreRank;
    
        if(Obj[i].reqQuery.length<=291){
            console.log(i+"個目の要求を分析しています");
            reqResult = await analizeRequire(Obj[i]);
            console.log(i+"個目の要求をWatsonに投げかけています");       
            reqScoreRank = await askReqDiscovery(Obj[i]);
            results4[i] = reqScoreRank.score;
            results1[i] = reqResult.wordNum;
            results8[i] = reqScoreRank.rank;
            reqEntities[i] = reqResult.entities;
        }else{
            console.log(i+"の要求が長すぎます");
            results4[i] = "-";
            results1[i] = "-";
            results8[i] = "-";
            checker[i] = 0;
        };
    
        if(Obj[i].funcQuery.length<=291){
            console.log(i+"個目の仕様を分析しています");
            funcScoreRank = await askFuncDiscovery(Obj[i]);
            console.log(i+"個目の仕様をWatsonに投げかけています");
            funcResult = await analizeFunction(Obj[i]);
            results5[i] = funcScoreRank.score;
            results3[i] = funcResult.wordNum;
            results9[i] = funcScoreRank.rank;
            funcEntities[i] = funcResult.entities;
        }else{
            console.log(i+"の仕様が長すぎます");
            results5[i] = "-";
            results3[i] = "-";
            results9[i] = "-";
            checker[i] = 0;
        };
    };

    

    //専門用語含有率を求める
    if(checker[i] != 0){
        console.log("専門用語含有率を求めています");
        for(i=0;i<Obj.length;i++){
            var counter = 0;
            for(j=0;j<reqEntities[i].length;j++){
                for(k=0;k<funcEntities[i].length;k++){
                    if(funcEntities[i][k] == reqEntities[i][j]){
                        counter += 1;
                    };
                };
            };
            results6[i] = counter/reqEntities[i].length;
            results7[i] = counter/funcEntities[i].length;
        };
    }else{
        results6[i] = "-";
        results7[i] = "-";
    };

    for(i=0;i<Obj.length;i++){
        csvFile = csvFile + results0[i] + "," + results1[i] + "," + results2[i] + "," + results3[i] + "," + results4[i] + "," + results6[i] + "," + results8[i] + "," + results5[i] + "," + results7[i] + "," + results9[i] + "," + results10[i] + "\n";
    };

    writeFile(csvFile);
    //console.log(results4);
    //console.log(results5);
    //console.log(results6);
    //console.log(results7);
    //console.log(results8);
    //console.log(results9);
    //console.log(reqEntities);
    //console.log(funcEntities);
};

                
