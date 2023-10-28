import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { bookmark } from './bookmark.service';
import { ExportService } from './export.service';
import { group } from './group.service';
import { tag } from './tag.service';

test.skip('base', async () => {
  const exportSvc = new ExportService(group, tag, bookmark);
  await exportSvc.run(19);
});

test.run();
