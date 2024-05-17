const upload_image = async (image: Buffer): Promise<string | null> => {
  const formData = new FormData();
  formData.append('gallery', 'wyFxG1G');
  formData.append('optsize', 0);
  formData.append('expire', 0);
  formData.append('numfiles', 1);
  formData.append('upload_session', '1715938191634.6706689860003695');

  const file = new Blob([image], { type: 'image/jpeg' });
  formData.append('file', file, `bbms_${Date.now()}.jpg`);
  // @ts-ignore
  const response = await fetch('https://postimages.org/json/rr', {
    method: 'POST',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0',
      Accept: 'application/json',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
      Origin: 'https://postimages.org',
      Connection: 'keep-alive',
      Referer: 'https://postimages.org/',
      Cookie: 'SESSIONKEY=WFjM7dgXYJM2Yvbj9FrbjnYQGwjd5nSgjjJ4',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      TE: 'trailers',
    },
    body: formData,
  });

  const data = await response.json();
  // @ts-ignore
  const { status, url } = data;
  if (status !== 'OK') {
    return null;
  }
  return url;
};

export { upload_image };
