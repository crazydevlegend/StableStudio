express = require("express");
cors = require("cors");
const gconfig = require("./config.json");
const app = express(express.json());
const axios = require("axios");

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.send("success");
});
app.post("/proxy/image", async (req, res) => {
  try {
    let data = JSON.stringify({
      prompt: `${req.query?.style} image, 
${req.query?.prompt}`,
      negative_prompt: req.query?.negative_prompt == "undefined" ? "" : req.query?.negative_prompt,
      num_images_per_prompt: req.query?.num_images_per_prompt ?? 1,
      width: req.query?.width,
      height: req.query?.height,
      seed: req.query?.seed,
      count: 50,
      return_all: true,
    });

    console.log(data);
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: gconfig.BTIAPAI_URL,
      headers: {
        "x-api-key": gconfig.API_KEY,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);
    const choices = response.data.choices;
    let images = {
      images: []
    };
    for (i = 0; i < choices?.length; i++) {
      for (j = 0; j< choices[i].images.length ; j++)
        images.images.push(choices[i].images[j]);
      if (images.images.length >= req.query?.num_images_per_prompt) {
        res.send(images);
        break;
      }
    }
    console.log(`| Sent---> | uids: ${response.data.uids} | send uid: ${choices[i].uid} | images: ${images.images.length}\n`);
  } catch (error) {
    console.error(error);
    res.status(500).send("There was an error processing your request.");
  }
});

app.listen(gconfig.PROXY_PORT, () => {
  console.log(`Proxy server running on PORT ${gconfig.PROXY_PORT}`);
});
