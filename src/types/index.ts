/** 音频元数据标签 */
export interface MusicTags {
  title?: string;
  artist?: string;
  album?: string;
  /** 年份，如 "2024" */
  year?: string;
  genre?: string;
  /** 歌词文本内容 */
  lyrics?: string;
  /** 音轨编号，如 "1" 或 "1/10" */
  trackNumber?: string;
  comment?: string;
  /** 支持任意自定义标签 */
  [key: string]: string | undefined;
}
