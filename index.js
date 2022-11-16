// Express 기본 모듈 불러오기
var express = require("express"),
  http = require("http"),
  path = require("path"),
  multer = require("multer"),
  axios = require("axios");

var { PythonShell } = require("python-shell");

// 익스프레스 객체 생성
var app = express();

var client_id = "YOUR_CLIENT_ID";
var client_secret = "YOUR_CLIENT_SECRET";

// 기본 속성 설정
app.set("port", process.env.PORT || 5000);

// body-parser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 라우터 객체 참조
var router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

var upload = multer({ storage: storage }).single("file");

var corsOptions = {
  origin: "http://localhost:3000/",
};

router.post("/food", upload, async (req, res) => {
  res.setHeader("Access-Control-Allow-origin", "*");
  // 1. child-process모듈의 spawn 취득
  const spawn = require("child_process").spawn;

  var flag = false;

  var foodName = "";

  var resultNum = 0;

  // 2. spawn을 통해 "python 파이썬파일.py" 명령어 실행
  const result = spawn("python", ["foodIdentifier.py", req.file.filename]);
  // 3. stdout의 'data'이벤트리스너로 실행결과를 받는다.
  result.stdout.on("data", function (chunk, error) {
    if (error) console.log("에러발생 ::: ", error);
    var textChunk = chunk.toString("utf8");
    resultNum++;
    if (resultNum == 3) {
      return res.status(200).json({ foodName: textChunk });
    }
  });
});

const translate = async (name) => {
  var api_url = "https://openapi.naver.com/v1/papago/n2mt";
  var request = require("request");
  var options = {
    url: api_url,
    form: { source: "ko", target: "en", text: query },
    headers: {
      "X-Naver-Client-Id": client_id,
      "X-Naver-Client-Secret": client_secret,
    },
  };

  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      return response;
    } else {
      console.log("error = " + response.statusCode);
    }
  });
};

const getAllIntro = async () => {
  let response;
  try {
    response = await axios.get(
      "http://211.237.50.150:7080/openapi/cbc78c23fdb1c5de126dfc34316cf91b0e831ea00591471c6ae31bfaffd9cb02/json/Grid_20150827000000000226_1/1/1000"
    );
  } catch (e) {
    console.log(e);
  }
  return response;
};

const getFoodIdList = async (name) => {
  let response;

  const params = { IRDNT_NM: name };
  try {
    response = await axios.get(
      "http://211.237.50.150:7080/openapi/cbc78c23fdb1c5de126dfc34316cf91b0e831ea00591471c6ae31bfaffd9cb02/json/Grid_20150827000000000227_1/1/100",
      { params }
    );
  } catch (e) {
    console.log(e);
  }
  return response;
};

const getRecipeById = async (id) => {
  let response;

  const params = { RECIPE_ID: id };

  try {
    response = await axios.get(
      "http://211.237.50.150:7080/openapi/cbc78c23fdb1c5de126dfc34316cf91b0e831ea00591471c6ae31bfaffd9cb02/json/Grid_20150827000000000228_1/1/20",
      { params }
    );
  } catch (err) {
    console.log(err);
  }
  return response;
};

const getIngredientById = async (id) => {
  let response;

  const params = { RECIPE_ID: id };

  try {
    response = await axios.get(
      "http://211.237.50.150:7080/openapi/cbc78c23fdb1c5de126dfc34316cf91b0e831ea00591471c6ae31bfaffd9cb02/json/Grid_20150827000000000227_1/1/30",
      { params }
    );
  } catch (err) {
    console.log(err);
  }
  return response;
};

router.get("/allIntro", (req, res) => {
  getAllIntro().then((response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(200)
      .json({ result: response.data.Grid_20150827000000000226_1 });
  });
});

router.get("/foodIdList", (req, res) => {
  getFoodIdList(req.query.IRDNT_NM).then((response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(200)
      .json({ result: response.data.Grid_20150827000000000227_1 });
  });
});

router.get("/recipe", (req, res) => {
  getRecipeById(req.query.RECIPE_ID).then((response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(200)
      .json({ result: response.data.Grid_20150827000000000228_1 });
  });
});

router.get("/ingredient", (req, res) => {
  getIngredientById(req.query.RECIPE_ID).then((response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(200)
      .json({ result: response.data.Grid_20150827000000000227_1 });
  });
});

// 라우터 객체를 app 객체에 등록
app.use("/", router);

// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all("*", function (req, res) {
  res.status(404).send("<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>");
});

// Express 서버 시작
http.createServer(app).listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
