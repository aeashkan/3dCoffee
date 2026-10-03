/**
 * parsCoffee - Interactive Scroll-Driven Coffee Experience
 */

document.addEventListener("DOMContentLoaded", () => {
    // ۱. راه‌اندازی اسکرول بی‌نهایت نرم Lenis
    const lenis = new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.5
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ۲. بارگذاری و مدیریت ویدیوی پشت‌زمینه (Coffee_make.mp4)
    const video = document.getElementById("coffee-video");
    const loader = document.getElementById("loader");
    const loaderBar = document.getElementById("loader-bar");
    const loaderPercent = document.getElementById("loader-percent");

    let videoDuration = 5; // مقدار پیش‌فرض تا زمان لود متادیتا
    let targetTime = 0;
    let videoReady = false;

    // تبدیل اعداد انگلیسی به فارسی برای زیبایی تایپوگرافی
    function toPersianDigits(n) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return n.toString().replace(/\d/g, x => persianDigits[x]);
    }

    function hideLoader() {
        if (!loader) return;
        loaderBar.style.width = "100%";
        loaderPercent.textContent = "۱۰۰٪";
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 700);
        }, 400);
    }

    // شبیه‌ساز درصد لود
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 15;
        if (progress > 95) progress = 95;
        loaderBar.style.width = `${progress}%`;
        loaderPercent.textContent = `${toPersianDigits(progress)}٪`;

        if (videoReady) {
            clearInterval(loadInterval);
            hideLoader();
        }
    }, 150);

    // اطمینان از اینکه لودر بیش از ۲.۵ ثانیه نماند حتی در صورت کندی ویدیو
    setTimeout(() => {
        clearInterval(loadInterval);
        hideLoader();
    }, 2500);

    if (video) {
        video.pause();

        const onVideoMetadataLoaded = () => {
            videoReady = true;
            if (video.duration && !isNaN(video.duration)) {
                videoDuration = video.duration;
            }
            video.currentTime = 0.01;
            setupVideoScrub();
        };

        if (video.readyState >= 1) {
            onVideoMetadataLoaded();
        } else {
            video.addEventListener("loadedmetadata", onVideoMetadataLoaded);
            video.addEventListener("canplay", () => {
                videoReady = true;
            });
        }
    }

    // ۳. اتصال پخش فریم‌های ویدیو به اسکرول کاربر (Scrubbing)
    function setupVideoScrub() {
        const scrollContainer = document.getElementById("scroll-container");
        if (!scrollContainer || !video) return;

        ScrollTrigger.create({
            trigger: scrollContainer,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                // محاسبه ثانیه متناظر با درصد اسکرول
                targetTime = self.progress * videoDuration;
            }
        });

        // حلقه هوشمند و بسیار روان برای به‌روزرسانی فریم‌های ویدیو
        let lastTime = -1;
        function renderLoop() {
            if (video && video.readyState >= 2) {
                const diff = targetTime - video.currentTime;
                // اگر اختلاف بیش از ۲۰ میلی‌ثانیه بود، فریم ویدیو را به‌روز کن
                if (Math.abs(diff) > 0.02) {
                    video.currentTime += diff * 0.18; // ضریب اینترپولیشن روان (Lerp)
                }
            }
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);
    }

    // اگر ویدیو زودتر آماده نشد، اسکراب با تایم پیش‌فرض فعال شود
    setupVideoScrub();

    // ۴. انیمیشن متنی مارکی در پس‌زمینه
    const marquee = document.querySelector(".marquee-content");
    if (marquee) {
        gsap.to(marquee, {
            xPercent: 30, // حرکت در جهت RTL
            ease: "none",
            scrollTrigger: {
                trigger: "#scroll-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }

    // ۵. انیمیشن سکشن‌های متنی و کارت‌های محصول در طول اسکرول
    const sections = document.querySelectorAll(".scroll-section");
    sections.forEach((section) => {
        const enter = parseFloat(section.dataset.enter || "0") / 100;
        const leave = parseFloat(section.dataset.leave || "100") / 100;
        const persist = section.dataset.persist === "true";
        const animType = section.dataset.animation;

        // قرار دادن سکشن در ارتفاع مناسب اسکرول
        const midPoint = (enter + leave) / 2;
        if (!section.style.top) {
            section.style.top = `${midPoint * 100}%`;
        }

        const elements = section.querySelectorAll("h1, h2, h3, p, .stat, .product-card-wrap, button, a");
        const tl = gsap.timeline({ paused: true });

        // انتخاب نوع انیمیشن بر اساس استانداردهای مهندسی UI
        switch (animType) {
            case "slide-right":
                tl.from(elements, { x: 80, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out" });
                break;
            case "slide-left":
                tl.from(elements, { x: -80, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out" });
                break;
            case "stagger-up":
                tl.from(elements, { y: 60, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" });
                break;
            case "fade-up":
            default:
                tl.from(elements, { y: 40, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out" });
                break;
        }

        const fadeRange = 0.04; // ۴٪ از طول اسکرول برای محو شدن آرام

        ScrollTrigger.create({
            trigger: "#scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                const p = self.progress;

                if (p >= enter && p <= leave) {
                    if (tl.progress() === 0 && !tl.isActive()) {
                        tl.play();
                    }

                    // ورود و خروج آرام با Opacity
                    if (p < enter + fadeRange) {
                        section.style.opacity = (p - enter) / fadeRange;
                    } else if (p > leave - fadeRange && !persist) {
                        section.style.opacity = (leave - p) / fadeRange;
                    } else {
                        section.style.opacity = "1";
                    }
                } else if (p > leave && persist) {
                    section.style.opacity = "1";
                } else {
                    section.style.opacity = "0";
                    if (tl.progress() > 0 && !persist) {
                        tl.progress(0).pause();
                    }
                }
            }
        });

        // وضعیت اولیه
        section.style.opacity = section.id === "hero" ? "1" : "0";
    });

    // ۶. انیمیشن شمارنده‌های آماری به زبان فارسی
    const statElements = document.querySelectorAll(".stat-number");
    statElements.forEach((el) => {
        const targetValue = parseFloat(el.dataset.value);
        let hasAnimated = false;

        ScrollTrigger.create({
            trigger: "#scroll-container",
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const p = self.progress;
                // وقتی به محدوده بخش آمار (حدود ۵۵٪ تا ۷۲٪) رسیدیم
                if (p >= 0.55 && p <= 0.75 && !hasAnimated) {
                    hasAnimated = true;
                    const counterObj = { val: 0 };
                    gsap.to(counterObj, {
                        val: targetValue,
                        duration: 2,
                        ease: "power2.out",
                        onUpdate: () => {
                            el.textContent = toPersianDigits(Math.round(counterObj.val));
                        }
                    });
                } else if (p < 0.50) {
                    hasAnimated = false;
                    el.textContent = "۰";
                }
            }
        });
    });
});

// ۷. سیستم مدیریت سبد خرید تعاملی و اعلان‌ها (Cart System)
let cartTotal = 0;
const cartCountBadge = document.getElementById("cart-count");
const cartToast = document.getElementById("cart-toast");
const toastTitle = document.getElementById("toast-title");
const toastDesc = document.getElementById("toast-desc");
let toastTimeout;

window.addToCart = function(productName, price) {
    cartTotal++;
    if (cartCountBadge) {
        cartCountBadge.textContent = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][cartTotal] || cartTotal;
        cartCountBadge.classList.add("scale-125");
        setTimeout(() => cartCountBadge.classList.remove("scale-125"), 200);
    }

    // نمایش اعلان با مشخصات دانه قهوه انتخاب شده
    if (cartToast) {
        toastTitle.textContent = `${productName} به سبد افزوده شد`;
        toastDesc.textContent = `قیمت: ${price.toLocaleString('fa-IR')} تومان • روست تازه`;
        cartToast.classList.add("show");

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            cartToast.classList.remove("show");
        }, 3200);
    }
};

window.handleNewsletter = function(e) {
    e.preventDefault();
    if (cartToast) {
        toastTitle.textContent = "کد تخفیف ۱۵٪ برای شما ارسال شد!";
        toastDesc.textContent = "کد تخفیف: PARSCOFFEE15 به همراه ارسال رایگان";
        cartToast.classList.add("show");
        setTimeout(() => {
            cartToast.classList.remove("show");
        }, 4000);
    }
    e.target.reset();
};
