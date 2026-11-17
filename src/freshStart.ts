import { db } from "./persistence";
import { resetWeiboRuntime } from "./skins/weiboData";

/**
 * 重新打开链接时回到初始状态：
 * 清掉上一次留下的手机存档（自己发的评论、点赞/关注状态、页面位置）、
 * 桌面布局（从 App Store 装的 App 等）与微博运行时数据（赞数、新增粉丝评论）。
 */
export async function resetPlayerState() {
  try {
    await db.saves.clear();
  } catch {
    /* 存储不可用时忽略 */
  }
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("foundphone-layout-v1")) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* 存储不可用时忽略 */
  }
  resetWeiboRuntime();
}
