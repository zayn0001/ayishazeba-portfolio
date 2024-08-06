import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from "firebase/auth";
import Modal from "../components/Modal";
import cloudinary from "../utils/cloudinary";
import getBase64ImageUrl from "../utils/generateBlurPlaceholder";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";
import 'firebase/auth';
import "../utils/config";
import axios from "axios"


const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  
  const router = useRouter();
  const { photoId } = router.query;
  const provider = new GoogleAuthProvider();
  
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();
  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);
  const [isAdmin, setIsAdmin] = useState<Boolean>(null)
  const [signedIn, setSignedIn] = useState<Boolean>(false)
  const [user, setUser] = useState<User>(null)


  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };


  const handleUpload = async () => {
    if (selectedImages.length === 0) return;

    setLoading(true);

    const uploadPromises = selectedImages.map(async (newimage) => {
      const formData = new FormData();
      formData.append('file', newimage);
      formData.append("upload_preset", "kztqwjxm");
      formData.append('folder', "AyishaZeba");

      try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, formData);
        console.log(response.data)
        return response.data.secure_url;
      } catch (err) {
        throw new Error(err.message);
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
    } catch (err: any) {
    } finally {
      setLoading(false);
      setTimeout(() => router.reload(), 1000);
    }
  };

  const checkAutoSignIn = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const token = localStorage.getItem("token");
        if (token) {
          setSignedIn(true);
          setIsAdmin(user.email === "ayishazebap@gmail.com");
          setUser(user);
          console.log("Auto signed-in user:", user);
        }
      }
    });
  };

  useEffect(() => {
    console.log(images)
    checkAutoSignIn();
  }, []);

  

  
  const handleSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        localStorage.setItem("token", token)
        console.log(user)
        setSignedIn(true)
        setIsAdmin(user.email=="ayishazebap@gmail.com")
        setUser(user)
      })
      .catch((error) => {
      });
  }

  useEffect(() => {
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);

  return (
    <>
      <Head>
        <title>Ayisha Zeba's Portfolio</title>
        <meta
          property="og:image"
          content="https://nextjsconf-pics.vercel.app/og-image.png"
        />
        <meta
          name="twitter:image"
          content="https://nextjsconf-pics.vercel.app/og-image.png"
        />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
          />
        )}
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          <div className="after:content relative flex mb-5 h-[629px] flex-col items-center justify-between gap-4 overflow-hidden rounded-lg bg-white/20 px-6  text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight py-16">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span style={{height: "-webkit-fill-available"}} className="flex max-h-full max-w-full items-center justify-center">
                {
                //<Bridge />
                <img src="ayisha.jpeg" style={{objectFit:"cover", height:"100%"}}></img>
                }
              </span>
              <span className="absolute left-0 right-0 bottom-0 h-[150px] bg-gradient-to-b from-white/0 via-grey to-black"></span>
              <span className="absolute left-0 right-0 top-0 h-[150px] bg-gradient-to-b from-white/0 via-grey to-black" style={{transform: "rotate(180deg)"}}></span>
            </div>
            <div>
            <h1 style={{fontSize:48}}>Ayisha</h1>
            <h1 style={{fontSize:48, marginTop:-30}}>Zeba's</h1>
            <h1 className=" mb-4 text-base font-bold uppercase tracking-widest">
              Portfolio
            </h1>
            </div>
            <>
            <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
              This portfolio showcases my best works as a 2025 NIFT graduate.
            </p>
            <button
              className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
              rel="noreferrer"
              onClick={handleSignIn}
            >
              {signedIn ? isAdmin ? "Hi Minuuuuuuuuuu" : `Hello ${user.displayName.split(" ")[0]}` : "Say Hi"}
            </button>
            </>
            
          </div>          
          
          {images.map(({ id, public_id, format, blurDataUrl }) => (
            <Link
              key={id}
              href={`/?photoId=${id}`}
              as={`/p/${id}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt="Next.js Conf photo"
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              />
            </Link>
          ))}
          { signedIn &&
            <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-center gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
              <h1 style={{fontSize:36}}>Upload Images</h1>
              <input type="file" multiple onChange={handleImageChange} />
              <button className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
                      rel="noreferrer" onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Image'}
              </button>
          </div>

          }
        </div>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">  
      With 🤍, {" "}    
        <a
          href="https://www.instagram.com/misshhhaallll/"
          target="_blank"
          className="font-semibold hover:text-white"
          rel="noreferrer"
        >
          Mishal
        </a>
        .
      </footer>
    </>
  );
};

export default Home;

export async function getStaticProps() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by("public_id", "desc")
    .max_results(400)
    .execute();
  let reducedResults: ImageProps[] = [];

  let i = 0;
  for (let result of results.resources) {
    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
    });
    i++;
  }

  const blurImagePromises = results.resources.map((image: ImageProps) => {
    return getBase64ImageUrl(image);
  });
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

  for (let i = 0; i < reducedResults.length; i++) {
    reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i];
  }

  return {
    props: {
      images: reducedResults,
    },
  };
}
