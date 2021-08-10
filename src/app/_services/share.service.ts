import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MetaTag } from '../_models/meta-tag';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private urlMeta = 'og:url';
  private titleMeta = 'og:title';
  private descriptionMeta = 'og:description';
  private imageMeta = 'og:image';
  private secureImageMeta = 'og:image:secure_url';

  constructor(private metaService: Meta) { }

  public setSocialMediaTags(url: string, title: string, description: string, image: string): void {
    const imageUrl = `${image}`;
    const tags = [
      new MetaTag(this.urlMeta, url),
      new MetaTag(this.titleMeta, title),
      new MetaTag(this.descriptionMeta, description),
      new MetaTag(this.imageMeta, imageUrl),
      new MetaTag(this.secureImageMeta, imageUrl)
    ];
    this.setTags(tags);
  }

  private setTags(tags: MetaTag[]): void {
    tags.forEach(siteTag => {
      this.metaService.updateTag({ property: siteTag.name, content: siteTag.value });
    });
  }
}
