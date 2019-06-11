export const AvatarTypes = (theme) => {
  return ({
    _base: {
      container: {
        alignItems: 'center',
        flexDirection: 'row',
      },
      image: {
        width: 30,
        height: 30
      },
      badge: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -2,
        right: -2
      },
      badgeText: {
        backgroundColor: 'transparent',
        fontSize: 9,
      }
    },
    big: {
      image: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 19
      },
      container: {
        flexDirection: 'column'
      }
    },
    small: {
      image: {
        width: 32,
        height: 32,
        borderRadius:16
      }
    },
    middle: {
      image: {
        width: 50,
        height: 50,
        borderRadius:16
      }
    },
    circle: {
      image: {
        borderRadius: 20
      },
    }
  })
};