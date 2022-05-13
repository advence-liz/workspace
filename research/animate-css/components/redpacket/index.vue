<template>
    <div>
        <div class="red">
            <transition name="red__cover">
                <div v-if="step === 1" class="red__cover" @click="coverClick">
                    <div :class="['red__cover__hd']"></div>
                    <div :class="['red__cover__ft']"></div>
                </div>
            </transition>

            <div
                @click="contentClick"
                :class="['red__content', step === 2 && 'zoomIn']"
            ></div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.red {
    position: relative;
    z-index: 0;
    &__cover {
        height: 500px;
        width: 100%;
        position: absolute;
        z-index: 1;
        &__hd {
            height: 60%;
            background: red;
        }
        &__ft {
            height: 40%;
            background: yellow;
        }
    }
    &__content {
        z-index: 0;
        height: 500px;
        background: blueviolet;
    }
}

.red__cover {
    &-leave-active {
        animation-duration: 1s;
        animation-fill-mode: both;
        animation-name: fadeOut;
        .red__cover {
            &__hd {
                animation-name: slideOutUp;
                animation-duration: 1s;
                animation-fill-mode: both;
            }

            &__ft {
                animation-name: slideOutDown;
                animation-duration: 1s;
                animation-fill-mode: both;
            }
        }
    }
}

@keyframes slideOutUp {
    from {
        transform: translate3d(0, 0, 0);
    }

    to {
        // visibility: hidden;
        // z-index: -1;
        // opacity: 0;
        transform: translate3d(0, -20%, 0);
    }
}
@keyframes slideOutDown {
    from {
        transform: translate3d(0, 0, 0);
    }

    to {
        // visibility: hidden;
        // z-index: -1;
        // opacity: 0;
        transform: translate3d(0, 20%, 0);
    }
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale3d(0.3, 0.3, 0.3);
    }

    50% {
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.zoomIn {
    animation-name: zoomIn;
    animation-duration: 1s;
    animation-fill-mode: both;
    animation-delay: 0.5s;
}

.slideOutDown {
    animation-name: slideOutDown;
    animation-duration: 1s;
    animation-fill-mode: both;
}

.slideOutUp {
    animation-name: slideOutUp;
    animation-duration: 1s;
    animation-fill-mode: both;
}
</style>

<script>
export default {
    name: 'redpacket',
    data() {
        return { step: 1 }
    },
    methods: {
        coverClick() {
            this.step = 2
        },
        contentClick() {
            alert(1)
        }
    },
    mounted() {
        setTimeout(() => {
            this.step = 2
        }, 1000)
    },
    computed: {}
}
</script>
