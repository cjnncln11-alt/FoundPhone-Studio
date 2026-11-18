import { copyFile } from "node:fs/promises";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
for (const name of ["LICENSE", "THIRD_PARTY_LICENSES.txt", "BRAND_NOTICE.txt"])
  await copyFile(name, "dist/" + name);
console.log("Runtime license notices included.");

await copyFile("src/vendor/mymy/NOTICE.txt", "dist/MYMY_NOTICE.txt");

// 视频统一走 HLS 分片（静态托管不支持 Range，整段 mp4 无法 seek）：
// 发布包里只留 hls/ 分片，整段 mp4 不再重复占体积
const videoDir = "dist/videos";
if (existsSync(videoDir)) {
  let dropped = 0;
  let bytes = 0;
  for (const f of readdirSync(videoDir)) {
    if (!f.endsWith(".mp4")) continue;
    const p = `${videoDir}/${f}`;
    bytes += statSync(p).size;
    rmSync(p);
    dropped += 1;
  }
  console.log(
    `Dropped ${dropped} whole mp4 (~${Math.round(bytes / 1048576)}MB) in favor of HLS segments.`,
  );
}
