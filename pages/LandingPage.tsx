
import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Users,
    BarChart3,
    Shield,
    Zap,
    CheckCircle2,
    ArrowRight,
    Menu,
    X,
    Globe,
    Moon,
    Sun,
    Star,
    TrendingUp,
    Clock,
    Smartphone,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin
} from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
    language: 'en' | 'ar';
    onLanguageChange: (lang: 'en' | 'ar') => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
    onGetStarted,
    language,
    onLanguageChange,
    isDarkMode,
    onThemeToggle
}) => {
    const isRtl = language === 'ar';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsMobileMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'features', 'benefits', 'pricing', 'testimonials', 'contact'];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'home', label: isRtl ? 'الرئيسية' : 'Home' },
        { id: 'features', label: isRtl ? 'المميزات' : 'Features' },
        { id: 'benefits', label: isRtl ? 'الفوائد' : 'Benefits' },
        { id: 'pricing', label: isRtl ? 'الأسعار' : 'Pricing' },
        { id: 'testimonials', label: isRtl ? 'آراء العملاء' : 'Testimonials' },
        { id: 'contact', label: isRtl ? 'اتصل بنا' : 'Contact' }
    ];

    const features = [
        {
            icon: Send,
            title: isRtl ? 'إرسال رسائل جماعية' : 'Bulk Messaging',
            description: isRtl ? 'أرسل آلاف الرسائل لعملائك في ثوانٍ مع التحكم الكامل في معدل الإرسال' : 'Send thousands of messages to your customers in seconds with full rate control'
        },
        {
            icon: Users,
            title: isRtl ? 'إدارة جهات الاتصال' : 'Contact Management',
            description: isRtl ? 'نظّم قاعدة بيانات عملائك بسهولة مع إمكانية التصنيف والتجميع' : 'Organize your customer database easily with categorization and grouping'
        },
        {
            icon: BarChart3,
            title: isRtl ? 'تحليلات متقدمة' : 'Advanced Analytics',
            description: isRtl ? 'احصل على رؤى عميقة حول أداء حملاتك ومعدلات التفاعل' : 'Get deep insights into your campaign performance and engagement rates'
        },
        {
            icon: MessageSquare,
            title: isRtl ? 'صندوق وارد موحد' : 'Unified Inbox',
            description: isRtl ? 'أدر جميع محادثاتك من مكان واحد مع فريق عملك' : 'Manage all your conversations from one place with your team'
        },
        {
            icon: Shield,
            title: isRtl ? 'أمان عالي' : 'High Security',
            description: isRtl ? 'حماية متقدمة لبياناتك مع تشفير من طرف إلى طرف' : 'Advanced protection for your data with end-to-end encryption'
        },
        {
            icon: Zap,
            title: isRtl ? 'سرعة فائقة' : 'Lightning Fast',
            description: isRtl ? 'أداء سريع وموثوق مع وقت تشغيل 99.9%' : 'Fast and reliable performance with 99.9% uptime'
        }
    ];

    const benefits = [
        {
            icon: TrendingUp,
            title: isRtl ? 'زيادة المبيعات' : 'Increase Sales',
            description: isRtl ? 'حقق زيادة تصل إلى 300% في معدلات التحويل' : 'Achieve up to 300% increase in conversion rates',
            stat: '300%'
        },
        {
            icon: Clock,
            title: isRtl ? 'توفير الوقت' : 'Save Time',
            description: isRtl ? 'وفر أكثر من 20 ساعة أسبوعياً في إدارة المحادثات' : 'Save over 20 hours weekly in conversation management',
            stat: '20h'
        },
        {
            icon: Users,
            title: isRtl ? 'رضا العملاء' : 'Customer Satisfaction',
            description: isRtl ? 'حسّن رضا عملائك بنسبة 95%' : 'Improve customer satisfaction by 95%',
            stat: '95%'
        }
    ];

    const pricingPlans = [
        {
            name: isRtl ? 'المبتدئ' : 'Starter',
            price: isRtl ? '99 ر.س' : '$29',
            period: isRtl ? 'شهرياً' : '/month',
            features: [
                isRtl ? '1,000 رسالة شهرياً' : '1,000 messages/month',
                isRtl ? 'رقم واتساب واحد' : '1 WhatsApp number',
                isRtl ? 'دعم فني أساسي' : 'Basic support',
                isRtl ? 'تحليلات أساسية' : 'Basic analytics'
            ],
            popular: false
        },
        {
            name: isRtl ? 'الاحترافي' : 'Professional',
            price: isRtl ? '299 ر.س' : '$79',
            period: isRtl ? 'شهرياً' : '/month',
            features: [
                isRtl ? '10,000 رسالة شهرياً' : '10,000 messages/month',
                isRtl ? '5 أرقام واتساب' : '5 WhatsApp numbers',
                isRtl ? 'دعم فني على مدار الساعة' : '24/7 support',
                isRtl ? 'تحليلات متقدمة' : 'Advanced analytics',
                isRtl ? 'إدارة الفريق' : 'Team management'
            ],
            popular: true
        },
        {
            name: isRtl ? 'المؤسسات' : 'Enterprise',
            price: isRtl ? 'مخصص' : 'Custom',
            period: '',
            features: [
                isRtl ? 'رسائل غير محدودة' : 'Unlimited messages',
                isRtl ? 'أرقام غير محدودة' : 'Unlimited numbers',
                isRtl ? 'دعم مخصص' : 'Dedicated support',
                isRtl ? 'تحليلات مخصصة' : 'Custom analytics',
                isRtl ? 'API مخصص' : 'Custom API',
                isRtl ? 'تدريب الفريق' : 'Team training'
            ],
            popular: false
        }
    ];

    const testimonials = [
        {
            name: isRtl ? 'أحمد محمد' : 'Ahmed Mohammed',
            role: isRtl ? 'مدير التسويق' : 'Marketing Manager',
            company: isRtl ? 'شركة النجاح' : 'Success Co.',
            image: 'https://i.pravatar.cc/150?img=12',
            text: isRtl
                ? 'WAPulse غيّر طريقة تواصلنا مع العملاء. زادت مبيعاتنا بنسبة 250% في 3 أشهر فقط!'
                : 'WAPulse transformed how we communicate with customers. Our sales increased by 250% in just 3 months!'
        },
        {
            name: isRtl ? 'سارة علي' : 'Sarah Ali',
            role: isRtl ? 'مديرة المبيعات' : 'Sales Director',
            company: isRtl ? 'متجر الإلكترونيات' : 'Electronics Store',
            image: 'https://i.pravatar.cc/150?img=45',
            text: isRtl
                ? 'أداة رائعة! وفرت لنا الكثير من الوقت والجهد في إدارة محادثات العملاء.'
                : 'Amazing tool! Saved us tons of time and effort in managing customer conversations.'
        },
        {
            name: isRtl ? 'خالد السعيد' : 'Khaled Alsaeed',
            role: isRtl ? 'صاحب متجر' : 'Store Owner',
            company: isRtl ? 'متجر الأزياء' : 'Fashion Store',
            image: 'https://i.pravatar.cc/150?img=33',
            text: isRtl
                ? 'الدعم الفني ممتاز والنظام سهل الاستخدام. أنصح به بشدة!'
                : 'Excellent support and easy-to-use system. Highly recommended!'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Fixed Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">WAPulse</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`text-sm font-semibold transition-colors ${activeSection === item.id
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-slate-600 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {/* Language Toggle */}
                            <button
                                onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Globe className="w-5 h-5 text-slate-600 dark:text-white" />
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => {
                                    console.log('Theme toggle clicked! Current isDarkMode:', isDarkMode);
                                    onThemeToggle();
                                }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5 text-slate-900 dark:text-white" /> : <Moon className="w-5 h-5 text-slate-900 dark:text-white" />}
                            </button>

                            {/* Get Started Button - Desktop */}
                            <button
                                onClick={onGetStarted}
                                className="hidden md:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {isRtl ? 'ابدأ الآن' : 'Get Started'}
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-900 dark:text-white" /> : <Menu className="w-6 h-6 text-slate-900 dark:text-white" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar Menu */}
                {isMobileMenuOpen && (
                    <>
                        {/* Overlay */}
                        <div
                            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>

                        {/* Sidebar */}
                        <div className={`md:hidden fixed top-0 bottom-0 ${isRtl ? 'left-0' : 'right-0'} h-screen w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl`}>
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                            <MessageSquare className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xl font-bold text-slate-900 dark:text-white">WAPulse</span>
                                    </div>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-900 dark:text-white" />
                                    </button>
                                </div>

                                {/* Navigation Items */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="space-y-2">
                                        {navItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                className={`block w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${activeSection === item.id
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                    : 'text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer with Get Started Button */}
                                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={onGetStarted}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        {isRtl ? 'ابدأ الآن' : 'Get Started'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20"></div>

                {/* Glowing Orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        {/* Badge with animation */}
                        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10 animate-fade-in-down backdrop-blur-sm">
                            <Zap className="w-4 h-4 animate-pulse" />
                            {isRtl ? 'منصة إدارة واتساب الأكثر تطوراً' : 'Most Advanced WhatsApp Management Platform'}
                        </div>

                        {/* Main Heading with gradient text */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-900 dark:text-white animate-fade-in-up">
                            {isRtl ? (
                                <>
                                    أدر محادثات <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent animate-gradient">واتساب</span> بذكاء
                                </>
                            ) : (
                                <>
                                    Manage WhatsApp <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent animate-gradient">Conversations</span> Intelligently
                                </>
                            )}
                        </h1>

                        {/* Description */}
                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in-up animation-delay-200">
                            {isRtl
                                ? 'منصة شاملة لإدارة محادثات واتساب، إرسال الحملات التسويقية، وتحليل الأداء. كل ما تحتاجه لتنمية عملك في مكان واحد.'
                                : 'Complete platform for managing WhatsApp conversations, sending marketing campaigns, and analyzing performance. Everything you need to grow your business in one place.'}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
                            <button
                                onClick={onGetStarted}
                                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-1 relative overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                <span className="relative">{isRtl ? 'ابدأ تجربتك المجانية' : 'Start Free Trial'}</span>
                                <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => scrollToSection('features')}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-slate-900 dark:text-white hover:bg-emerald-50 dark:hover:bg-emerald-900/10 backdrop-blur-sm"
                            >
                                {isRtl ? 'اكتشف المزيد' : 'Learn More'}
                            </button>
                        </div>

                        {/* Stats with glassmorphism */}
                        <div className="flex items-center justify-center gap-8 pt-8 animate-fade-in-up animation-delay-600">
                            <div className="text-center group">
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">5,000+</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{isRtl ? 'عميل نشط' : 'Active Users'}</div>
                            </div>
                            <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                            <div className="text-center group">
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">1M+</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{isRtl ? 'رسالة يومية' : 'Daily Messages'}</div>
                            </div>
                            <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                            <div className="text-center group">
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">99.9%</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{isRtl ? 'وقت التشغيل' : 'Uptime'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                            {isRtl ? 'مميزات قوية لعملك' : 'Powerful Features for Your Business'}
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            {isRtl
                                ? 'كل ما تحتاجه لإدارة محادثات واتساب بكفاءة واحترافية'
                                : 'Everything you need to manage WhatsApp conversations efficiently and professionally'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900"></div>
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                            {isRtl ? 'لماذا تختار WAPulse؟' : 'Why Choose WAPulse?'}
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            {isRtl
                                ? 'نتائج حقيقية يمكنك قياسها'
                                : 'Real results you can measure'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 rounded-2xl text-white overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
                            >
                                {/* Decorative Orbs */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>

                                {/* Animated Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10">
                                    <benefit.icon className="w-12 h-12 mb-6 opacity-90 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                                    <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">{benefit.stat}</div>
                                    <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                                    <p className="text-emerald-50 leading-relaxed">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                            {isRtl ? 'خطط تناسب جميع الأحجام' : 'Plans for All Sizes'}
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            {isRtl
                                ? 'اختر الخطة المناسبة لعملك وابدأ في النمو اليوم'
                                : 'Choose the right plan for your business and start growing today'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <div
                                key={index}
                                className={`group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up ${plan.popular
                                    ? 'border-emerald-500 shadow-2xl shadow-emerald-500/30 scale-105'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                            >
                                {/* Glow effect for popular plan */}
                                {plan.popular && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl -z-10"></div>
                                )}

                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                        {isRtl ? 'الأكثر شعبية' : 'Most Popular'}
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className={`text-5xl font-bold ${plan.popular ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                                        {plan.period && <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3 group/item">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                                            <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={onGetStarted}
                                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${plan.popular
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40'
                                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 text-slate-900 dark:text-white border border-transparent'
                                        }`}
                                >
                                    {isRtl ? 'ابدأ الآن' : 'Get Started'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
                <div className="absolute top-1/3 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                            {isRtl ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            {isRtl
                                ? 'آلاف الشركات تثق في WAPulse لإدارة محادثاتها'
                                : 'Thousands of businesses trust WAPulse for their conversations'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                            >
                                {/* Stars */}
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform"
                                            style={{ transitionDelay: `${i * 0.05}s` }}
                                        />
                                    ))}
                                </div>

                                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed italic">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="relative w-12 h-12 rounded-full ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{testimonial.name}</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {testimonial.role} • {testimonial.company}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                {/* Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                                    {isRtl ? 'تواصل معنا' : 'Get in Touch'}
                                </h2>
                                <p className="text-xl text-slate-600 dark:text-slate-400">
                                    {isRtl
                                        ? 'فريقنا جاهز لمساعدتك في أي وقت. تواصل معنا الآن!'
                                        : 'Our team is ready to help you anytime. Contact us now!'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-lg hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold mb-1 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{isRtl ? 'البريد الإلكتروني' : 'Email'}</div>
                                        <a href="mailto:support@wapulse.com" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">support@wapulse.com</a>
                                    </div>
                                </div>

                                <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-lg hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold mb-1 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{isRtl ? 'الهاتف' : 'Phone'}</div>
                                        <a href="tel:+966501234567" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">+966 50 123 4567</a>
                                    </div>
                                </div>

                                <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-lg hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold mb-1 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{isRtl ? 'العنوان' : 'Address'}</div>
                                        <div className="text-slate-600 dark:text-slate-400">
                                            {isRtl ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-xl">
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                                        {isRtl ? 'الاسم' : 'Name'}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                        placeholder={isRtl ? 'أدخل اسمك' : 'Enter your name'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                                        {isRtl ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                        placeholder={isRtl ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                                        {isRtl ? 'الرسالة' : 'Message'}
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none text-slate-900 dark:text-white"
                                        placeholder={isRtl ? 'اكتب رسالتك هنا' : 'Write your message here'}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1"
                                >
                                    {isRtl ? 'إرسال الرسالة' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Logo and Name */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                                <MessageSquare className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-3xl font-bold">WAPulse</span>
                        </div>

                        {/* Description */}
                        <p className="text-slate-400 leading-relaxed max-w-2xl mb-8">
                            {isRtl
                                ? 'منصة شاملة لإدارة محادثات واتساب وتنمية عملك. نوفر لك جميع الأدوات التي تحتاجها للتواصل الفعال مع عملائك وزيادة مبيعاتك.'
                                : 'Complete platform for managing WhatsApp conversations and growing your business. We provide all the tools you need for effective customer communication and sales growth.'}
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex items-center gap-4 mb-8">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Contact Information */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Phone className="w-4 h-4 text-emerald-500" />
                                <a href="tel:+966501234567" className="font-medium">+966 50 123 4567</a>
                            </div>

                            <div className="w-px h-4 bg-slate-700"></div>

                            <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Mail className="w-4 h-4 text-emerald-500" />
                                <a href="mailto:support@wapulse.com" className="font-medium">support@wapulse.com</a>
                            </div>

                            <div className="w-px h-4 bg-slate-700"></div>

                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span className="font-medium">
                                    {isRtl ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
                        <p>© 2024 WAPulse. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
