export default function OurActivities() {
    // 👉 Paste ALL your YouTube links here
    const videoLinks = [
        "https://youtu.be/bW8DIJO-2dc?si=leohmcL6ZGfXyYW3",
        "https://youtu.be/YpS9MPP8quI?si=js9b4gqShz2zuybH",
        "https://youtu.be/YWMiSQtqKPE?si=BXy4zwu9tX_dSgpQ",
        "https://youtu.be/MTvYgWZVIwQ?si=6FdadsbCAu1qGP_a",
        "https://youtu.be/gRsQe5OHI8w?si=pUr7NB--5Ekh4UYK",
        "https://youtu.be/jxtMjFTLfaY?si=PrpeA4ZIZUVErNod",
        "https://youtu.be/JcV7mvoEfic?si=od1bKLWuSjV-MeBy",
        "https://youtu.be/R7qelB0q7rk?si=IIbOndERClwNcftS",
        "https://youtu.be/2ifA-zIymSw?si=zteAZJpEDzvL7Y06",
        "https://youtu.be/IjZy5QpJx0U?si=aDljIeHXVEe8JfVN",
        "https://youtu.be/wJcp1phJvS8?si=O_ZuFz3_yKg4nofY",
        "https://youtu.be/YWMiSQtqKPE?si=r593UP4Km_-ur8Ka",
        "https://youtu.be/VQpo4nOUZ9o?si=PnIPuAKRRZjNHBnb",
        "https://youtu.be/WGNdDVXPrnc?si=JNhV1ZSA6Yie5pSj",
        "https://youtu.be/QForuL5NuBk?si=SILOywnUIAWXJJ09",
        "https://youtu.be/pRVvPBkTdPc?si=2fBntS_Z7rr4xdK0",
        "https://youtu.be/QForuL5NuBk?si=tg1E0397plw0E7O8",
        "https://youtu.be/QForuL5NuBk?si=D01zqBI_f-EUzW7J",
        "https://youtu.be/bW8DIJO-2dc?si=cGyKi9iNUVY9wNnG",
        "https://youtu.be/HdVdLRrZnXw?si=IhI9Kf1CSz04WD3e",
        "https://youtu.be/oPAZCSc43pk?si=reQB6e-vCuzWJ7wf",
        "https://youtu.be/AlMQdviwSGE?si=kJKVc-axCabVVJD4",
        "https://youtu.be/sV21BwKfjCg?si=aDsdAwOLg7sjym-e",
        "https://youtu.be/MZo42jY6dP0?si=oFBMToV2Kk3RMMyj",
        "https://youtu.be/qN8GjJ4AZoc?si=nwgWVfUtnMPyvjQK",
        "https://youtu.be/oPAZCSc43pk?si=uk5wv_UJygkIbfB6",
        "https://youtu.be/tSF16Lmpz2Q?si=EQPwiXdB1aMmPDmT",
        "https://youtu.be/udhhGM7yac4?si=--KXRlK7VmcQ1M7Q",
        "https://youtu.be/9NJMe1nzSJw?si=LO4re9k9Ryi_3AfW",
        "https://youtu.be/pvEYS4MBsgQ?si=KqA4UrLp64jX4zFw",
        "https://youtu.be/O9WxUTXRfys?si=Oy8rnAzeRy3diri9",
        "https://youtu.be/mxI_SeAtSxk?si=qIDoO4tPvAO7fma1",
        "https://youtu.be/f09Qxoma96U?si=C8ErUhLS8VnUVVPb",
        "https://youtu.be/vvjQa2MP61E?si=z9RLgBb9fKNB4jiu",
        "https://youtu.be/cIx61Y7GJek?si=af3kdsR-SXNJNT21",
        "https://youtu.be/k-8nuXlccBk?si=B7xXEzLiwwnfxN1J",
        "https://youtu.be/WT8i_8DfEjU?si=N7M2TyNyoXIIPEfm",
        "https://youtu.be/xQe7vLEAfKo?si=QIacucM54VREoYEQ",
        "https://youtu.be/UXxNtZAxFaA?si=DR4BJ9KtGK2NDq3B",
        "https://youtu.be/5K0YZtUta1k?si=WH0nyh7ysZfpTZyb",
        "https://youtu.be/RrjkdIZkejA?si=pLAJKPzZSnE0Dqv_",
        "https://youtu.be/oL9Q0BnpbYY?si=RSh-pY5noyuKqa89",
        "https://youtu.be/YY50UK3zidM?si=ytcLZctyWYmLKo4O",
        "https://youtu.be/Nd5oQRyYZAA?si=MQ5rXvrsKV0sGZMn",
        "https://youtu.be/4j8G2gZoLfw?si=B7Dm3HNOeU5yO3Q1",
        "https://youtu.be/zZIkcq54Mug?si=4UOX7mnRQUH34gEF",
        "https://youtu.be/T3A61rFCjt0?si=B0FOxSkLu0xVLh5q",
        "https://youtu.be/x7XHNigL0zE?si=XploxNYP_EJReWzX",
        "https://youtu.be/SK92LefojzM?si=0DdEiH6ZIo3mRh9b",
        "https://youtu.be/9GuoEtabvQQ?si=l4NCLxiaq3zILCSn",
        "https://youtu.be/RuzSKjK_d8I?si=4zXzXJnnYpkb5ivd",
        "https://youtu.be/cp1UjtauiPE?si=gcHm5PZq7Zb_6SUk",
        "https://youtu.be/SU1i7JV3mZg?si=lsCAs2Lb913tvzir",
        "https://youtu.be/RtIYk3J4wOg?si=EqPD-tPQFXHp8DBs",
        "https://youtu.be/pwtxZSmQfBU?si=U6mygOu2cM5m0fvg",
        "https://youtu.be/g3Tx5jYEwG0?si=-BXjCseT9cD-NK9O",
        "https://youtu.be/g9iSwZy5QKk?si=ajIdhJsZg7pnXlGR",
        "https://youtu.be/mkdFzhYBrSg?si=KeWyYo2QDC6RBKn5",
        "https://youtu.be/vyBTvIlMyLc?si=le8CEmITpJ6uzIeQ",
        "https://youtu.be/cAg5p-EobfI?si=usiijGbglrHZ9UPC",
        "https://youtu.be/oPz9oAYsefw?si=JJGx4SDSOLd8mzYM",
        "https://youtu.be/SFQ7wov-ZTc?si=q10Xrh3501kqzU0I",
        "https://youtu.be/ZLBDxubzEV4?si=2li2dPE_WctuRxx1",
        "https://youtu.be/HWXxiViIWIg?si=eETzWgnuEuoVjSQJ",
        "https://youtu.be/AmN6xhIXJZI?si=dLu-BPPAW-nEz4mI",
        "https://youtu.be/-YD2qOSpGoc?si=5GnpjVKUncrTX2pS",
        "https://youtu.be/dyan87G6AOg?si=_cEsMAVGmPErtMga",
        "https://youtu.be/Za5r05uhjF0?si=HrOCfQn1pJymS7Ln",
        "https://youtu.be/47CzvMlJxJQ?si=8ftViI47CSgzGD-E",
        "https://youtu.be/zOBTFvx50fw?si=B1rpFgwS7CgSf6ac",
        "https://youtu.be/ArGgbQvCB_E?si=9iRiej4lVxUZPQb9",
        "https://youtu.be/5uz1ua6sAAo?si=-vgZkGS7tYZ-mfYl",
        "https://youtu.be/hMurbpLoox0?si=7SgF9Au2q5X5FWkB",
        "https://youtu.be/mrF-gbcDoz8?si=8pqXvkguDHfiw1Uc",
        "https://youtu.be/jPoLuJ9Zyjc?si=zcGU-qdhI0J3HHP5",
        "https://youtu.be/jPoLuJ9Zyjc?si=6tL7ZNyDyLlVRlQ_",
        "https://youtu.be/5XrMXU8twl0?si=JW6h6lhRU1rC-MWj",
        "https://youtu.be/5F_ZZQmvzvI?si=-7xmnbaSDNZKKzbx",
        "https://youtu.be/UZ6DfocGwuA?si=stL3mPKyPRXBJpWe",
        "https://youtu.be/KUZBpa7ziLE?si=V1L907xCm_H2ZLZ8",
        "https://youtu.be/_nYBlKfP6Kc?si=cAjdUq-DRiZxO3WS",
        "https://youtu.be/ClP9bWNW_QY?si=cpp4gJMJnjn80t7f",
        "https://youtu.be/ad5nPHd5ptk?si=OLKvGp1TJ3zmdLH_",
        "https://youtu.be/bKFeQ_mBDbg?si=SWbpvi-Da9zycF2s",
        "https://youtu.be/AHg_YSoaxVs?si=uz8g9GotEzTNawpO",
        "https://youtu.be/iA9XYy5pb80?si=3CRDlEHQ3DgeBhJd",
        "https://youtu.be/OGJ4tRxPtT0?si=q_vL6WBt6ZAZGiHM",
        "https://youtu.be/mi745SO2vqM?si=hHhRTnWFKF5pORzB",
        "https://youtu.be/MM5vSQA5wlQ?si=bGKP29ZSEcylxfs6",
        "https://youtu.be/HMzALBnVYRE?si=24pUtWKsG51bHYkL",
        "https://youtu.be/hHgv9BP6KR4?si=E-bUqgEc2P6xiHXS",
        "https://youtu.be/1-Mr2_3S9Lk?si=IxUGncrY9AEQzWgZ",
        "https://youtu.be/wxRb7Vwsels?si=ebUNuyacrd-7z6r8",
        "https://youtu.be/C3okRLBZknw?si=A0rv0ta92Gb8h_85",
        "https://youtu.be/Yvcufh770Ww?si=-1V1rkcHPy4oi0Qm",
        "https://youtu.be/05QXtWq4LKw?si=Oi8R3-GB3DJ_puQj",
        "https://youtu.be/Cm3wvSF5zFc?si=9WHK7jp0lRaWhhNE",
        "https://youtu.be/us8cbKQ0qzc?si=ZODz4SIPcYJMO2-u",
        "https://youtu.be/EPvLya1vHeA?si=NJwWrNENGzIKiCDt",
        "https://youtu.be/pt1PayEmXiU?si=FHmPSPQFj_ZNl9_L",
        "https://youtu.be/VWN_YWWLE4w?si=yi9dQraNq8vnfE4E",
        "https://youtu.be/srf3Pa1Sot4?si=m6kUFAcRfgDVXKXc",
        "https://youtu.be/R8xIlxki-Us?si=HuoRXTE8S3gGL5Df",
        "https://youtu.be/RPx2ceW9Hz8?si=FqHwlpXhjWLt9eeN",
        "https://youtu.be/8MnB6CKoOts?si=8FoHenca8piNK2uo",
        "https://youtu.be/kYiUls_7srE?si=ZibqvcaE_8y1jGfh",
        "https://youtu.be/uSzBXPhzARA?si=zVC9mUGvzPGgJdHh",
        "https://youtu.be/QYn7wIlhKA4?si=yG0TkdhZTzixORSJ",
        "https://youtu.be/nttqVNP304k?si=NN-PtttKaU9fwvir",
        "https://youtu.be/Htw0ZYxwSHQ?si=OO81LB9uu8uZ8z_M",
        "https://youtu.be/pO3QvKgMRMw?si=nI6_jspIHx6pefWW",
        "https://youtu.be/9yFfmceq6IY?si=PPiCQxmZLft99SBX",
        "https://youtu.be/eo2x3qI_Gq0?si=8G9fNXluu0NXiItu",
        "https://youtu.be/UIwwMkDgDZE?si=xn9vd2niCOxmpXL1",
        "https://youtu.be/U7sjdK4P8NQ?si=I2AlZHc5QI60YRSM",
       


    ];

    // 👉 Function to extract video ID from any YouTube link
    const getVideoId = (url: string) => {
        if (url.includes("youtu.be/")) {
            return url.split("youtu.be/")[1].split("?")[0];
        }
        if (url.includes("watch?v=")) {
            return url.split("watch?v=")[1].split("&")[0];
        }
        return "";
    };

    return (
        <section className="py-20 bg-gray-50 border-t">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Our Activities
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videoLinks.map((link, index) => {
                        const videoId = getVideoId(link);
                        if (!videoId) return null;

                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <iframe
                                    className="w-full h-56"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={`Activity Video ${index + 1}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
