import { ContentType } from '@/constant'

/**
 * 文件类型筛选
 */
export class KindFilterModel {
  id: string
  label: string
  // 规则：多个文件类型用 `|` 分隔开，排除用 `!`
  value: string
  enabled: boolean

  constructor(
    id: string,
    label: string,
    value: string,
    enabled: boolean = true
  ) {
    this.id = id
    this.label = label
    this.value = value
    this.enabled = enabled
  }

  public static readonly ANY = new KindFilterModel('0', 'All', '')

  public static DEFAULT_KINDS = this.defaultKindFilters()

  public static defaultKindFilters() {
    let id = 0
    return [
      new KindFilterModel((id++).toString(), 'All', ''),
      new KindFilterModel((id++).toString(), 'Pictures', ContentType.IMAGE),
      new KindFilterModel((id++).toString(), 'Audios', ContentType.AUDIO),
      new KindFilterModel(
        (id++).toString(),
        'Videos',
        `${ContentType.MOVIE}!${ContentType.MPEG2_TS}`
      ),
      new KindFilterModel((id++).toString(), 'PDF', ContentType.PDF),
      new KindFilterModel(
        (id++).toString(),
        'WORD',
        [ContentType.PAGES, ContentType.DOC, ContentType.DOCX].join('|')
      ),
      new KindFilterModel((id++).toString(), 'EXCEL', ContentType.SPREADSHEET),
      new KindFilterModel((id++).toString(), 'PPT', ContentType.PRESENTATION),
      new KindFilterModel(
        (id++).toString(),
        'Applications',
        ContentType.APPLICATION,
        false
      ),
      new KindFilterModel(
        (id++).toString(),
        'Folders',
        ContentType.FOLDER,
        false
      ),
      new KindFilterModel(
        (id++).toString(),
        'Archives',
        ContentType.ARCHIVE,
        false
      ),
      new KindFilterModel(
        (id++).toString(),
        'MD',
        ContentType.MARKDOWN,
        false
      )
    ]
  }
}

export default KindFilterModel
