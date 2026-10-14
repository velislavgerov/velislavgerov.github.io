"""Copy only public website assets for Cloudflare Pages."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent.parent
out=root/'dist'
out.mkdir(exist_ok=True)
public=['index.html','styles.css','resume.pdf','favicon.ico','favicon-32.png','favicon-192.png','apple-touch-icon.png','og-image.png','og-image.svg','assets','experiments']
public += [p.name for p in root.glob('*.html') if p.name!='index.html']
for name in public:
 src=root/name
 if src.is_dir(): shutil.copytree(src,out/name,dirs_exist_ok=True)
 elif src.is_file(): shutil.copy2(src,out/name)
print(f'Built public site in {out}')
