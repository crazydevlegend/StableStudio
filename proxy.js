express = require("express");
cors = require("cors");
const gconfig = require("./config.json");
const app = express(express.json());
const axios = require("axios");

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post("/proxy/image", async (req, res) => {
  try {
    let data = JSON.stringify({
      prompt: `${req.query?.style} image, 
${req.query?.prompt}`,
      negative_prompt: req.query?.negative_prompt == "undefined" ? "" : req.query?.negative_prompt,
      num_images_per_prompt: req.query?.num_images_per_prompt ?? 1,
      width: req.query?.width,
      height: req.query?.height,
    });

    console.log(data);
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.bitapai.io/image",
      headers: {
        "x-api-key": gconfig.API_KEY,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);
    res.send(response.data.choices[0]);
    console.log(`| Sent---> | uids: ${response.data?.uids} | images: ${response.data?.choices?.at(0)?.images?.length}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("There was an error processing your request.");
  }
});

app.listen(gconfig.PROXY_PORT, () => {
  console.log(`Proxy server running on PORT ${gconfig.PROXY_PORT}`);
});
