// 프로그램을 실행 시키면 주소를 받는다.
// 해당 다나와 프로덕트 주소에서 프로덕션들을 크롤링한다.
// 다음 페이지면 다음 페이지로 넘어간다.
// 마지막 페이지면 메모리에 들어있는 데이터를 파일로 저장하고 끝낸다.

import readline from "readline";
import puppeteer from "puppeteer";

const rl = readline.createInterface({
  input: process.stdin,
});

console.log(
  `다나와  URL를 입력해주세요.\n예) http://prod.danawa.com/list/?cate=1936375`
);
rl.once("line", async (url) => {
  const gotoUrl = url || "http://prod.danawa.com/list/?cate=1936375";
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(gotoUrl);

  const products = [];
  let pageNum = 1;

  let isEmpty = await page.$("p.nothing_comment");
  while (!isEmpty) {
    isEmpty = await page.$("p.nothing_comment");
    products.push(
      ...(await page.$$eval("div.prod_main_info", (e) =>
        e.map((el) => {
          const trimText = (text: string | null | undefined) => {
            if (typeof text === "string") {
              return text.replace(/\s+/g, " ").trim();
            }
            return null;
          };
          const name = trimText(
            el.querySelector("a[name=productName]")?.textContent
          );
          const specList = trimText(
            el.querySelector("div.spec_list")?.textContent
          );
          const price =
            specList &&
            specList
              .slice(specList.indexOf("출시가: ") + 5, specList.length - 1)
              .replace(",", "");

          const imgUrl = el
            .querySelector("a.thumb_link > img")
            ?.getAttribute("src");
          console.log(imgUrl, "이미wl");

          return {
            name,
            price,
            imgUrl,
          };
        })
      ))
    );

    pageNum++;
    page.evaluate((pageNum) => movePage(pageNum), pageNum);
    await page.waitForSelector("img[alt=로딩중]", { hidden: true });
  }
  console.log(products);
});
