#!/usr/bin/env node
'use strict';
// 把 public/videos/*.mp4 转成 HLS 分片（fMP4，零重编码）。
// 静态托管不支持 HTTP Range，整段 mp4 的 seekable 恒为 [0,0]，任何快进都会回到开头；
// 切成 6 秒一片后可由 hls.js 按片加载，任意定位。
// 用法：node scripts/build-hls.mjs [--only n160,n22] [--clean]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const videosDir = resolve('public/videos');
const outRoot = join(videosDir, 'hls');
const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.slice(7).split(',').filter(Boolean)) : null;
const clean = args.includes('--clean');

const mp4s = readdirSync(videosDir)
  .filter((f) => f.endsWith('.mp4'))
  .filter((f) => !only || only.has(basename(f, '.mp4')));

console.log(`共 ${mp4s.length} 个视频待处理`);
let made = 0;
let skipped = 0;
let reencoded = 0;
/** 平均关键帧间隔（秒）：太长的视频按关键帧切会得到超大分片，需要先重编码补关键帧 */
function keyGap(file) {
  try {
    const out = execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-skip_frame',
        'nokey',
        '-show_entries',
        'frame=pts_time',
        '-of',
        'csv=p=0',
        file,
      ],
      { encoding: 'utf8' },
    );
    const n = out.split('\n').filter((x) => x.trim()).length;
    const dur = parseFloat(
      execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
        { encoding: 'utf8' },
      ).trim(),
    );
    return n > 0 ? dur / n : dur;
  } catch {
    return 0;
  }
}
/** 视频码率（bps）：重编码时按原码率给，避免体积暴涨 */
function videoBitrate(file) {
  try {
    const v = parseInt(
      execFileSync(
        'ffprobe',
        [
          '-v',
          'error',
          '-select_streams',
          'v:0',
          '-show_entries',
          'stream=bit_rate',
          '-of',
          'csv=p=0',
          file,
        ],
        { encoding: 'utf8' },
      ).trim(),
      10,
    );
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}
for (const file of mp4s) {
  const name = basename(file, '.mp4');
  const src = join(videosDir, file);
  const dir = join(outRoot, name);
  const playlist = join(dir, 'index.m3u8');
  const fresh =
    existsSync(playlist) &&
    statSync(playlist).mtimeMs >= statSync(src).mtimeMs &&
    readdirSync(dir).some((f) => f.endsWith('.m4s'));
  if (fresh) {
    skipped += 1;
    continue;
  }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const gap = keyGap(src);
  const needReencode = gap > 8;
  const hlsArgs = [
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_type',
    'fmp4',
    '-hls_fmp4_init_filename',
    'init.mp4',
    '-hls_flags',
    'independent_segments',
    '-hls_segment_filename',
    join(dir, 'seg_%03d.m4s'),
    playlist,
  ];
  execFileSync(
    'ffmpeg',
    needReencode
      ? [
          '-y',
          '-v',
          'error',
          '-i',
          src,
          '-c:v',
          'libopenh264',
          '-b:v',
          `${Math.max(500, Math.round((videoBitrate(src) * 1.15) / 1000))}k`,
          '-g',
          '60',
          '-c:a',
          'copy',
          ...hlsArgs,
        ]
      : ['-y', '-v', 'error', '-i', src, '-c', 'copy', ...hlsArgs],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
  if (needReencode) reencoded += 1;
  made += 1;
  if (made % 5 === 0) console.log(`  已转 ${made} 个…`);
}
console.log(
  `完成：新转 ${made}（其中重编码补关键帧 ${reencoded}），跳过 ${skipped}，输出 ${outRoot}`,
);
if (clean) console.log('（源 mp4 未删除，需要时手动清理）');
