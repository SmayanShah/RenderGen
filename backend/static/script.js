
function setupImageUpload() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('image-upload');
    
    if (!uploadArea || !fileInput) {
        console.error('Upload elements not found');
        return function() { return null; }; // Return a dummy function if elements aren't found
    }
    
    let uploadedImage = null;
    
    // Function to handle the file selection
    function handleFileSelect(file) {
        if (!file || !file.type.match('image.*')) {
            showCustomAlert('Invalid File', 'Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Create a preview of the image
        const reader = new FileReader();
        reader.onload = function(e) {
            // Clear the upload area first
            while (uploadArea.firstChild) {
                uploadArea.removeChild(uploadArea.firstChild);
            }
            
            // Create and add the image preview
            const imgPreview = document.createElement('img');
            imgPreview.src = e.target.result;
            imgPreview.classList.add('uploaded-image-preview');
            uploadArea.appendChild(imgPreview);
            
            // Create and add the remove button
            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-image-button');
            removeButton.innerHTML = '×';
            removeButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering upload area click
                removeImage();
            });
            uploadArea.appendChild(removeButton);
            
            // Store the uploaded file
            uploadedImage = file;
            
            // Store the file for later submission (for backward compatibility)
            window.uploadedFile = file;
        };
        
        reader.readAsDataURL(file);
    }
    
    // Function to remove the image
    function removeImage() {
        // Clear the upload area
        while (uploadArea.firstChild) {
            uploadArea.removeChild(uploadArea.firstChild);
        }
        
        // Restore the original content
        const icon = document.createElement('i');
        icon.className = 'fas fa-cloud-upload-alt';
        uploadArea.appendChild(icon);
        
        const text = document.createElement('p');
        text.className = 'upload-area-text';
        text.textContent = 'Drag & drop an image or click to browse';
        uploadArea.appendChild(text);
        
        // Clear the file input
        fileInput.value = '';
        uploadedImage = null;
        window.uploadedFile = null;
    }
    
    // Click on upload area to trigger file input
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Event listener for file input change
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            handleFileSelect(this.files[0]);
        }
    });
    
    // Event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, function() {
            uploadArea.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, function() {
            uploadArea.classList.remove('drag-over');
        }, false);
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        if (dt.files && dt.files[0]) {
            handleFileSelect(dt.files[0]);
        }
    }, false);
    
    // Return function to get the uploaded image
    return function() {
        return uploadedImage || window.uploadedFile;
    };
}
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const sectionTop = section.getBoundingClientRect().top;
        const offsetPosition = sectionTop + window.pageYOffset - 20; // 20px offset from top
        
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    }
}
     // Enhanced custom alert function that accepts title and message parameters
     function showCustomAlert(title, message) {
        const customAlert = document.getElementById('custom-alert');
        const alertTitle = customAlert.querySelector('h3');
        const alertMessage = customAlert.querySelector('p');
        
        // Update the alert content
        alertTitle.textContent = title;
        alertMessage.textContent = message;
        
        // Show the alert
        customAlert.classList.add('active');
        
        // Focus on the OK button for accessibility
        document.getElementById('alert-close-btn').focus();
        
        // Add event listener to close button (with cleanup)
        const closeBtn = document.getElementById('alert-close-btn');
        const closeAlert = () => {
            customAlert.classList.remove('active');
            closeBtn.removeEventListener('click', closeAlert);
        };
        closeBtn.addEventListener('click', closeAlert);
        
        // Also close on ESC key
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                customAlert.classList.remove('active');
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
        
        // Close when clicking outside the alert content
        const closeOnOutsideClick = (e) => {
            if (e.target === customAlert) {
                customAlert.classList.remove('active');
                customAlert.removeEventListener('click', closeOnOutsideClick);
            }
        };
        customAlert.addEventListener('click', closeOnOutsideClick);
    }
    
let getUploadedImage = function() { return null; };

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
           // Initialize the image upload functionality
           window.getUploadedImage = setupImageUpload();

    
           // Hide loader after a short timeout (even if 3D doesn't load)
    setTimeout(() => {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }, 2000);
    
    
     
        // Update the existing generate button to use the new upload functionality
        const generateImageBtn = document.querySelector('#image-tab .btn-primary');
        if (generateImageBtn) {
            // Remove any existing click handlers
            const newGenerateBtn = generateImageBtn.cloneNode(true);
            generateImageBtn.parentNode.replaceChild(newGenerateBtn, generateImageBtn);
            
            // Add our new click handler
            // Add our new click handler
         newGenerateBtn.addEventListener('click', function() {
           const uploadedImage = window.getUploadedImage(); // Call the function to get the image

           if (uploadedImage) {
                      // Call the API function
                     generateModelFromImageAPI(uploadedImage);
                    }            else {
                                showCustomAlert('Image Required', 'Please upload an image first.');
                             }
           });
        }
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    
    if (isLowEndDevice) {
        setRenderQuality('low');
    } else {
        setRenderQuality('high');
    }

    // Try-catch blocks for 3D initialization to prevent blocking
    try {
        initHeroScene();
    } catch (error) {
        console.error("Error initializing hero scene:", error);
        // Remove canvas container if there's an error
        const heroContainer = document.getElementById('canvas-container');
        if (heroContainer) {
            heroContainer.innerHTML = '<div class="fallback-content">3D Experience Unavailable</div>';
        }
    }

    try {
        initPreviewScene();
    } catch (error) {
        console.error("Error initializing preview scene:", error);
        // Remove preview canvas if there's an error
        const previewCanvas = document.getElementById('preview-canvas');
        if (previewCanvas) {
            previewCanvas.innerHTML = '<div class="fallback-content">3D Preview Unavailable</div>';
        }
    }

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const ctaButtons = document.querySelector('.cta-buttons');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        ctaButtons.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Tab switching in demo section
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current button and content
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
// Enhanced Image Upload Functionality


// Initialize the upload functionality
let getUploadedImage;
  

    // Testimonial slider
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;

    function showSlide(index) {
        testimonials.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    showSlide(currentSlide);

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
        showSlide(currentSlide);
    });

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % testimonials.length;
        showSlide(currentSlide);
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentSlide = i;
            showSlide(currentSlide);
        });
    });

    // Auto-rotate testimonials
    setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonials.length;
        showSlide(currentSlide);
    }, 5000);

        // Preview controls
        const rotateBtn = document.getElementById('rotate');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetBtn = document.getElementById('reset');
        const toggleGridBtn = document.getElementById('toggle-grid');

        let autoRotate = false;
        window.autoRotate = true; // Set global auto-rotate to true by default
        rotateBtn.classList.add('active');
        toggleGridBtn.classList.add('active');
        let gridVisible = true; // Start with grid visible
       
        rotateBtn.addEventListener('click', () => {
            // Toggle the auto-rotation state
            window.autoRotate = !window.autoRotate;
            
            // Update button appearance
            rotateBtn.classList.toggle('active', window.autoRotate);
            
            // Log the state change for debugging
            console.log("Auto-rotation toggled:", window.autoRotate);
        });
        //  grid toggle button event listener here
            toggleGridBtn.addEventListener('click', () => {
                      // Toggle grid visibility
                      gridVisible = !gridVisible;
    
                     // Update button appearance
                     toggleGridBtn.classList.toggle('active', gridVisible);
    
                     // Toggle grid visibility in the scene
                     if (previewScene) {
                           // Find the grid helper in the scene
                           previewScene.children.forEach(child => {
                           if (child instanceof THREE.GridHelper) {
                            child.visible = gridVisible;
                            }
                           });
             }
    
                console.log("Grid visibility toggled:", gridVisible);
         });
        
        zoomInBtn.addEventListener('click', () => {
            if (previewCamera.fov > 10) {
                previewCamera.fov -= 5;
                previewCamera.updateProjectionMatrix();
            }
        });
        
        zoomOutBtn.addEventListener('click', () => {
            if (previewCamera.fov < 100) {
                previewCamera.fov += 5;
                previewCamera.updateProjectionMatrix();
            }
        });
        
        resetBtn.addEventListener('click', () => {
            previewCamera.position.set(0, 0, 5);
            previewCamera.fov = 45;
            previewCamera.updateProjectionMatrix();
            previewControls.reset();
            autoRotate = false;
            rotateBtn.classList.remove('active');
        });

        
        // Scroll animations
        const sections = document.querySelectorAll('section');
        
        function checkScroll() {
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (sectionTop < windowHeight * 0.75) {
                    section.classList.add('fade-in');
                }
            });
        }
        
        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Check on initial load
        
        // Demo generation buttons
        const generateTextBtn = document.querySelector('#text-tab .btn-primary');
        //const generateImageBtn = document.querySelector('#image-tab .btn-primary');
        
        generateTextBtn.addEventListener('click', () => {
            const textPrompt = document.querySelector('#text-tab textarea').value;
            if (textPrompt.trim() !== '') {
                // Call the API function instead of simulateGeneration
                generateModelFromAPI(textPrompt);
            } else {
                showCustomAlert('Description Required', 'Please enter a description first.');
            }
        });
        
       // generateImageBtn.addEventListener('click', () => {
          //  if (fileInput.files.length) {
                // Call the API function instead of simulateGeneration
            //    generateModelFromImageAPI(fileInput.files[0]);
            //} else {
              //  showCustomAlert('Image Required', 'Please upload an image first.');
           // }
       // });
        
        
   
        
        
        function simulateGeneration() {
            // Show loading state
            const previewCanvas = document.getElementById('preview-canvas');
            previewCanvas.innerHTML = `
                <div class="generation-loading">
                    <div class="spinner"></div>
                    <p>Generating 3D model...</p>
                </div>
            `;
            
            // Simulate AI processing time
            setTimeout(() => {
                // Reset the canvas and show a new 3D model
                previewCanvas.innerHTML = '';
                loadRandomModel();
            }, 3000);
        }
        
        function loadRandomModel() {
            // This would be replaced with actual model loading based on generation
            const models = ['cube', 'sphere', 'torus'];
            const randomModel = models[Math.floor(Math.random() * models.length)];
            
            // Reset the preview scene
            initPreviewScene(randomModel);
        }
    });
    
    // Three.js Implementations
    let heroScene, heroCamera, heroRenderer;
    let previewScene, previewCamera, previewRenderer, previewControls;
    let heroModel, previewModel;
    
    function setRenderQuality(quality) {
        // Low, medium, high settings
        switch(quality) {
            case 'low':
                if (heroRenderer) heroRenderer.setPixelRatio(1);
                if (previewRenderer) previewRenderer.setPixelRatio(1);
                break;
            case 'medium':
                if (heroRenderer) heroRenderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
                if (previewRenderer) previewRenderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
                break;
            case 'high':
                if (heroRenderer) heroRenderer.setPixelRatio(window.devicePixelRatio);
                if (previewRenderer) previewRenderer.setPixelRatio(window.devicePixelRatio);
                break;
        }
    }

    function initHeroScene() {
        // Create scene
        heroScene = new THREE.Scene();
        heroScene.background = new THREE.Color(0x0f172a);
        
        // Create camera
        heroCamera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
        heroCamera.position.z = 5;
        
        // Create renderer
        const heroContainer = document.getElementById('canvas-container');
        heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
        heroRenderer.setPixelRatio(window.devicePixelRatio);
        heroContainer.appendChild(heroRenderer.domElement);
        
        // Add OrbitControls to make the model interactive
        heroControls = new THREE.OrbitControls(heroCamera, heroRenderer.domElement);
        heroControls.enableDamping = true;
        heroControls.dampingFactor = 0.05;
        heroControls.rotateSpeed = 0.7;
        heroControls.zoomSpeed = 0.7;  // Smoother zoom
        
        // Limit zoom range
        heroControls.enableZoom = true;
        heroControls.minDistance = 3;  // Minimum zoom (closest to the model)
        heroControls.maxDistance = 8;  // Maximum zoom (furthest from the model)
        
        // Disable panning
        heroControls.enablePan = false;
        
        // Variables to track user interaction
        let userInteracting = false;
        let autoRotationTimer = null;
        
        // Add event listeners to detect user interaction
        heroControls.addEventListener('start', function() {
            userInteracting = true;
            clearTimeout(autoRotationTimer);
        });
        
        heroControls.addEventListener('end', function() {
            userInteracting = false;
            // Resume auto-rotation after 2 seconds of inactivity
            autoRotationTimer = setTimeout(function() {
                userInteracting = false;
            }, 2000);
        });
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        heroScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        heroScene.add(directionalLight);
        
        // Add a colorful particle system as background
        createParticles(heroScene);
        
        // Add a floating 3D model
        createFloatingModel();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            heroCamera.aspect = heroContainer.clientWidth / heroContainer.clientHeight;
            heroCamera.updateProjectionMatrix();
            heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
        });
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Update controls
            heroControls.update();
            
            // Auto-rotate the model when user is not interacting
            if (!userInteracting && heroModel) {
                heroModel.rotation.y += 0.005;
                heroModel.rotation.x += 0.002;
                
                // Add a floating animation
                const time = Date.now() * 0.001;
                heroModel.position.y = Math.sin(time) * 0.2;
            }
            
            // Animate particles
            animateParticles();
            
            heroRenderer.render(heroScene, heroCamera);
        }
        
        animate();
    }
    
    
    
    function initPreviewScene(modelType = 'cube') {
        // Create scene
        previewScene = new THREE.Scene();
        
        // Create a gradient background (like Meshy.ai)
        const bgColor1 = new THREE.Color(0x1e293b);
        const bgColor2 = new THREE.Color(0x0f172a);
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, bgColor1.getStyle());
        gradient.addColorStop(1, bgColor2.getStyle());
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        const bgTexture = new THREE.CanvasTexture(canvas);
        previewScene.background = bgTexture;
        
        // Create camera with adjusted position for better viewing angle
        previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        
        // Position camera at an angle (30-45 degrees above horizontal)
        previewCamera.position.set(3, 3, 5); // Move up and to the side for better 3D perspective
        previewCamera.lookAt(0, 0, 0); // Look at the center
        
        // Create renderer
        const previewContainer = document.getElementById('preview-canvas');
        
        // Clear previous renderer if it exists
        while (previewContainer && previewContainer.firstChild) {
            previewContainer.removeChild(previewContainer.firstChild);
        }
        
        previewRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true  // Needed for taking screenshots
        });
        previewRenderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
        previewRenderer.setPixelRatio(window.devicePixelRatio);
        previewRenderer.shadowMap.enabled = true;
        previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set correct color space
        if (THREE.ColorManagement) {
            previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
        } else {
            previewRenderer.outputEncoding = THREE.sRGBEncoding;
        }
        
        previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        previewRenderer.toneMappingExposure = 1.0;
        previewContainer.appendChild(previewRenderer.domElement);
        
        // Add orbit controls with better configuration
        previewControls = new THREE.OrbitControls(previewCamera, previewRenderer.domElement);
        previewControls.enableDamping = true;
        previewControls.dampingFactor = 0.05;
        previewControls.rotateSpeed = 0.7;
        previewControls.zoomSpeed = 0.7;  // Smoother zoom
        
        // Limit zoom range
        previewControls.enableZoom = true;
        previewControls.minDistance = 2;  // Minimum zoom (closest to the model)
        previewControls.maxDistance = 10;  // Maximum zoom (furthest from the model)
        
        // Enable panning with right mouse button only
        previewControls.enablePan = true;
        previewControls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        
        // Add enhanced lighting for 3D visibility
        // Main directional light (key light)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 7.5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        previewScene.add(mainLight);
        
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        previewScene.add(ambientLight);
        
        // Fill light from opposite direction
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-5, 5, -7.5);
        previewScene.add(fillLight);
        
        // Bottom light to illuminate underside
        const bottomLight = new THREE.DirectionalLight(0xffffff, 0.3);
        bottomLight.position.set(0, -10, 0);
        previewScene.add(bottomLight);
        
        // Add grid helper with professional appearance
        const gridHelper = new THREE.GridHelper(10, 20, 0x555555, 0x333333);
        gridHelper.position.y = 0; // Position slightly below the model
        previewScene.add(gridHelper);
        
        // Create model based on type if specified
        if (modelType) {
            createModel(modelType);
        }
        
        // Add environment map for reflections
        if (window.THREE && THREE.PMREMGenerator) {
            try {
                const pmremGenerator = new THREE.PMREMGenerator(previewRenderer);
                pmremGenerator.compileEquirectangularShader();
                
                // Create a simple environment map
                const envScene = new THREE.Scene();
                envScene.background = new THREE.Color(0x444444);
                
                const envLight1 = new THREE.DirectionalLight(0xffffff, 1);
                envLight1.position.set(5, 5, 5);
                envScene.add(envLight1);
                
                const envLight2 = new THREE.DirectionalLight(0xffffff, 1);
                envLight2.position.set(-5, -5, -5);
                envScene.add(envLight2);
                
                const envTexture = pmremGenerator.fromScene(envScene).texture;
                previewScene.environment = envTexture;
                
                pmremGenerator.dispose();
            } catch (error) {
                console.error("Error creating environment map:", error);
            }
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            previewCamera.aspect = previewContainer.clientWidth / previewContainer.clientHeight;
            previewCamera.updateProjectionMatrix();
            previewRenderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
        });
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Update controls
            previewControls.update();
            
            // Auto-rotate if enabled
            if (window.autoRotate && previewModel) {
                previewModel.rotation.y += 0.005; // Slower rotation speed
            }
            
            previewRenderer.render(previewScene, previewCamera);
        }
        
        animate();
    }    
    
    function createParticles(scene) {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const colorPalette = [
            new THREE.Color(0x6366f1), // Primary
            new THREE.Color(0x8b5cf6), // Purple
            new THREE.Color(0xec4899), // Pink
            new THREE.Color(0x10b981), // Secondary
        ];
        
        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            
            // Color
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);
        
        // Store for animation
        scene.userData.particles = particleSystem;
    }
    
    function animateParticles() {
        if (heroScene.userData.particles) {
            const particles = heroScene.userData.particles;
            const positions = particles.geometry.attributes.position.array;
            const time = Date.now() * 0.0001;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + positions[i] * 0.1) * 0.002;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.rotation.y += 0.0005;
        }
    }
    
    function createFloatingModel() {
        // Create a complex geometric shape
        const geometry = new THREE.IcosahedronGeometry(1.5, 1);
        
        // Create a shader material with gradient
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                colorA: { value: new THREE.Color(0x6366f1) },
                colorB: { value: new THREE.Color(0xec4899) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 colorA;
                uniform vec3 colorB;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    float noise = sin(vPosition.x * 5.0 + time) * sin(vPosition.y * 5.0 + time) * sin(vPosition.z * 5.0 + time);
                    vec3 color = mix(colorA, colorB, vUv.y + noise * 0.2);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            wireframe: true
        });
        
        heroModel = new THREE.Mesh(geometry, material);
        heroScene.add(heroModel);
        
        // Animation update function
        function updateMaterial(time) {
            material.uniforms.time.value = time;
        }
        
        // Add to animation loop
        heroScene.userData.updateFunctions = heroScene.userData.updateFunctions || [];
        heroScene.userData.updateFunctions.push(updateMaterial);
    }
    
    function createModel(type) {
        let geometry;
        
        switch (type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.8, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.7, 0.3, 16, 100);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        // Create material with professional appearance
        const material = new THREE.MeshStandardMaterial({
            color: 0x6366f1,
            metalness: 0.3,
            roughness: 0.4,
            envMapIntensity: 1.0
        });
        
        previewModel = new THREE.Mesh(geometry, material);
        previewModel.castShadow = true;
        previewModel.receiveShadow = true;
        previewScene.add(previewModel);
    }
    
    
    // Global variables for auto-rotation
    let autoRotate = false;
  
   
// Function to generate model from text prompt
function generateModelFromAPI(prompt) {
    // Show loading state
    const previewCanvas = document.getElementById('preview-canvas');
    previewCanvas.innerHTML = `
        <div class="generation-loading">
            <div class="spinner"></div>
            <p>Generating 3D model...</p>
        </div>
    `;
    
    // Remove any existing download button
    removeDownloadButton();
    
    // Create form data
    const formData = new FormData();
    formData.append('prompt', prompt);
    
    // Call Flask API
    fetch('/generate', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showCustomAlert('Error', data.error);
            // Reset preview canvas
            previewCanvas.innerHTML = '';
            initPreviewScene('cube'); // Fallback to default
        } else {
            // Show success message
            showCustomAlert('Success', 'Model generated successfully!');
            
            console.log("Model file:", data.file);
            
            // Debug the model loading
            debugModelLoading(data.file);
            
            // Load the generated model
            loadGeneratedModel(data.file);
            
            // Add download button beside generate button
            addDownloadButton(data.file, 'text-tab');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showCustomAlert('Error', 'Failed to generate model: ' + error.message);
        
        // Reset preview canvas
        previewCanvas.innerHTML = '';
        initPreviewScene('cube'); // Fallback to default
    });
}


function generateModelFromImageAPI(file) {
    // Show loading state
    const previewCanvas = document.getElementById('preview-canvas');
    previewCanvas.innerHTML = `
        <div class="generation-loading">
            <div class="spinner"></div>
            <p>Generating 3D model from image...</p>
        </div>
    `;
    
    // Remove any existing download button
    removeDownloadButton();
    
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    
    // Call Flask API
    fetch('/generate', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showCustomAlert('Error', data.error);
            // Reset preview canvas
            previewCanvas.innerHTML = '';
            initPreviewScene('cube'); // Fallback to default
        } else {
            // Show success message
            showCustomAlert('Success', 'Model generated successfully!');
            
            console.log("Model file:", data.file);
            
            // Debug the model loading
            debugModelLoading(data.file);
            
            // Load the generated model
            loadGeneratedModel(data.file);
            
            // Add download button beside generate button
            addDownloadButton(data.file, 'image-tab');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showCustomAlert('Error', 'Failed to generate model: ' + error.message);
        
        // Reset preview canvas
        previewCanvas.innerHTML = '';
        initPreviewScene('cube'); // Fallback to default
    });
}

// Function to add download button beside the generate button
function addDownloadButton(filename, tabId) {
    // Remove any existing download button first
    removeDownloadButton();
    
    // Create download button with exact same styling as other buttons
    const downloadBtn = document.createElement('a');
    downloadBtn.href = `/download/${filename}`;
    downloadBtn.className = 'btn btn-primary download-model-btn';
    downloadBtn.textContent = 'Download Model';
    downloadBtn.download = filename;
    
    // Apply inline styles to match exactly
    downloadBtn.style.display = 'inline-block';
    downloadBtn.style.fontWeight = 'inherit';
    downloadBtn.style.textAlign = 'center';
    downloadBtn.style.verticalAlign = 'middle';
    downloadBtn.style.userSelect = 'none';
    downloadBtn.style.padding = '0.375rem 0.75rem'; // Standard Bootstrap padding
    downloadBtn.style.fontSize = '1rem';
    downloadBtn.style.lineHeight = '1.5';
    downloadBtn.style.borderRadius = '0.25rem';
    downloadBtn.style.textDecoration = 'none';
    
    // Find the generate button to copy its exact styles
    const tabContainer = document.getElementById(tabId);
    if (tabContainer) {
        const generateBtn = tabContainer.querySelector('.btn-primary');
        if (generateBtn) {
            // Get computed styles of the generate button
            const computedStyle = window.getComputedStyle(generateBtn);
            
            // Copy exact styles from the generate button
            downloadBtn.style.padding = computedStyle.padding;
            downloadBtn.style.borderRadius = computedStyle.borderRadius;
            downloadBtn.style.fontSize = computedStyle.fontSize;
            downloadBtn.style.lineHeight = computedStyle.lineHeight;
            downloadBtn.style.fontWeight = computedStyle.fontWeight;
            
            // Create a button container if it doesn't exist
            let buttonContainer = generateBtn.parentElement;
            
            // If the generate button is not in a container, create one
            if (!buttonContainer.classList.contains('button-container')) {
                // Create a container for the buttons
                buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '10px';
                buttonContainer.style.marginTop = '15px';
                
                // Replace the generate button with the container
                generateBtn.parentElement.insertBefore(buttonContainer, generateBtn);
                buttonContainer.appendChild(generateBtn);
            }
            
            // Add the download button to the container
            buttonContainer.appendChild(downloadBtn);
        }
    }
}


// Function to remove download button
function removeDownloadButton() {
    const downloadBtns = document.querySelectorAll('.download-model-btn');
    downloadBtns.forEach(btn => btn.remove());
}

// Modified loadGeneratedModel function to not add the download button to the canvas
function loadGeneratedModel(filename) {
    console.log("Starting to load model:", filename);
    
    // Create or reset the preview scene first
    const previewCanvas = document.getElementById('preview-canvas');
    previewCanvas.innerHTML = '';
    initPreviewScene(null); // Initialize a fresh scene without a default model
    
    // Make sure THREE.PLYLoader is available
    if (!THREE.PLYLoader) {
        console.error('THREE.PLYLoader is not available');
        showCustomAlert('Error', 'PLY loader not available. Please check your Three.js dependencies.');
        return;
    }
    
    // Load the PLY file
    const loader = new THREE.PLYLoader();
    const modelUrl = `/download/${filename}`;
    
    // Show loading indicator in the preview canvas
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = '<div class="spinner"></div><p>Loading 3D model...</p>';
    previewCanvas.appendChild(loadingDiv);
    
    // Set a timeout to remove the loading indicator if loading takes too long
    const loadingTimeout = setTimeout(() => {
        console.log("Loading timeout reached");
        if (loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
        showCustomAlert('Error', 'Loading timed out. The model may be too large or there might be a connection issue.');
    }, 30000); // 30 seconds timeout
    
    // Load the model with cache-busting
    const cacheBustUrl = `${modelUrl}?t=${new Date().getTime()}`;
    
    loader.load(
        cacheBustUrl,
        // Success callback
        function(geometry) {
            clearTimeout(loadingTimeout);
            console.log("Model loaded successfully", geometry);
            
            // Remove loading indicator
            if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }
            
            try {
                // Debug information
                console.log("Geometry attributes:", Object.keys(geometry.attributes));
                console.log("Vertex count:", geometry.attributes.position.count);
                
                // Check if geometry has color attribute
                const hasVertexColors = geometry.attributes.color !== undefined;
                console.log("Has vertex colors:", hasVertexColors);
                
                // CRITICAL: Ensure the geometry is properly formed for 3D viewing
                
                // 1. Compute bounding box
                geometry.computeBoundingBox();
                
                // 2. Center the model
                const center = geometry.boundingBox.getCenter(new THREE.Vector3());
                geometry.translate(-center.x, -center.y, -center.z);
                
                // 3. Get model size for scaling
                const size = geometry.boundingBox.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                console.log("Model size:", size, "Max dimension:", maxDim);
                
                // 4. Scale model to a reasonable size
                const scale = 2 / maxDim;
                geometry.scale(scale, scale, scale);
                
                // 5. IMPORTANT: Force recomputation of normals for proper 3D appearance
                if (geometry.attributes.normal) {
                    geometry.deleteAttribute('normal');
                }
                geometry.computeVertexNormals();
                
                // 6. Check if the model is potentially flat (2D)
                const isTooFlat = size.x < 0.01 || size.y < 0.01 || size.z < 0.01;
                if (isTooFlat) {
                    console.warn("Model appears to be flat. Attempting to add thickness...");
                    // This is a simplified approach - for a real solution, you'd need more complex geometry processing
                    geometry = new THREE.ExtrudeGeometry(
                        new THREE.Shape().fromPoints(
                            Array.from({ length: geometry.attributes.position.count }, (_, i) => {
                                return new THREE.Vector2(
                                    geometry.attributes.position.array[i * 3],
                                    geometry.attributes.position.array[i * 3 + 1]
                                );
                            })
                        ),
                        { depth: 0.2, bevelEnabled: false }
                    );
                }
                
                let material;
                
                if (hasVertexColors) {
                    // Enhanced material settings for vertex colors
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        metalness: 0.1,
                        roughness: 0.5,
                        side: THREE.DoubleSide, // Render both sides to ensure visibility
                        flatShading: false      // Smooth shading for better appearance
                    });
                } else {
                    // Default material if no vertex colors
                    material = new THREE.MeshStandardMaterial({
                        color: 0x6366f1,
                        metalness: 0.1,
                        roughness: 0.5,
                        side: THREE.DoubleSide
                    });
                }
                
                // Remove any existing model
                if (previewModel) {
                    previewScene.remove(previewModel);
                }
                
                // Create the mesh
                previewModel = new THREE.Mesh(geometry, material);
                previewModel.castShadow = true;
                previewModel.receiveShadow = true;
                
                // Add the model to the scene
                previewScene.add(previewModel);
                console.log("Model added to scene");
                
                // Set up camera for optimal viewing
                setupOptimalCameraView(previewModel, previewCamera, previewControls);
                
                // Enable auto-rotation
                window.autoRotate = true;
                
                // Update UI to reflect auto-rotation state
                const rotateBtn = document.getElementById('rotate');
                if (rotateBtn) {
                    rotateBtn.classList.add('active');
                }
                
                console.log("Model setup complete");
            } catch (err) {
                console.error("Error processing geometry:", err);
                showCustomAlert('Error', 'Failed to process the model geometry: ' + err.message);
                
                // Fallback to default cube
                initPreviewScene('cube');
            }
        },
        
        // Progress callback
        function(xhr) {
            if (xhr.lengthComputable) {
                const percent = xhr.loaded / xhr.total * 100;
                console.log(`${percent.toFixed(2)}% loaded`);
                loadingDiv.innerHTML = `<div class="spinner"></div><p>Loading 3D model... ${percent.toFixed(0)}%</p>`;
            } else {
                console.log(`Loaded ${xhr.loaded} bytes`);
            }
        },
        
        // Error callback
        function(error) {
            clearTimeout(loadingTimeout);
            console.error('Error loading model:', error);
            showCustomAlert('Error', 'Failed to load the generated model: ' + error);
            
            // Remove loading indicator
            if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }
            
            // Fallback to default cube
            initPreviewScene('cube');
        }
    );
}

// New function to set up optimal camera view for the model
function setupOptimalCameraView(model, camera, controls) {
    // Compute bounding sphere
    const boundingSphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
    
    // Set camera position based on bounding sphere
    const offset = boundingSphere.radius * 2.5;
    camera.position.set(offset, offset * 0.8, offset);
    camera.lookAt(boundingSphere.center);
    camera.updateProjectionMatrix();
    
    // Update controls target to center of model
    controls.target.copy(boundingSphere.center);
    controls.update();
    
    // Set reasonable zoom limits based on model size
    controls.minDistance = boundingSphere.radius * 1.2;
    controls.maxDistance = boundingSphere.radius * 5;
    
    return { camera, controls };
}



// Add this function to your JavaScript
function debugModelLoading(filename) {
    console.log("Debugging model loading for:", filename);
    
    // Test if PLYLoader is available
    if (typeof THREE === 'undefined') {
        console.error("THREE is not defined!");
        return;
    }
    
    if (typeof THREE.PLYLoader === 'undefined') {
        console.error("THREE.PLYLoader is not available!");
        return;
    }
    
    console.log("THREE.PLYLoader is available");
    
    // Test if we can access the download URL
    const modelUrl = `/download/${filename}`;
    console.log("Attempting to fetch:", modelUrl);
    
    fetch(modelUrl)
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Model URL is accessible");
            return response.blob();
        })
        .then(blob => {
            console.log("Model data received:", blob.size, "bytes", "type:", blob.type);
            
            // Test if the file is a valid PLY file
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const firstLine = content.slice(0, 100); // Get first part of file
                console.log("File header:", firstLine);
                
                if (firstLine.includes("ply")) {
                    console.log("File appears to be a valid PLY file");
                } else {
                    console.error("File does not appear to be a valid PLY file!");
                }
            };
            reader.readAsText(blob.slice(0, 100)); // Read just the beginning
        })
        .catch(error => {
            console.error("Error accessing model URL:", error);
        });
}



    
    
    

    